use crate::config::Config;
use anyhow::Result;
use once_cell::sync::Lazy;
use regex::Regex;
use std::{
    collections::HashSet,
    sync::{Arc, Mutex, MutexGuard},
};
use twilight_gateway::Event;
use twilight_http::{request::channel::reaction::RequestReactionType, Client};

static PATTERNS: Lazy<Vec<Regex>> = Lazy::new(|| {
    vec![
        Regex::new(r"(?i)^[hue]{5,}$").unwrap(),
        Regex::new(r"(?i)^[bha]{5,}$").unwrap(),
        Regex::new(r"(?i)^[lo]{5,}$").unwrap(),
        Regex::new(r"^https?://").unwrap(),
        Regex::new(r"^re{5,}").unwrap(),
        Regex::new(r"^<:\w+:\d+>$").unwrap(),
        Regex::new(r"^<@!?\d+>$").unwrap(),
        Regex::new(r"^!").unwrap(),
        Regex::new(r"^\d+$").unwrap(),
    ]
});

static WORDS: Lazy<Mutex<HashSet<String>>> = Lazy::new(|| Mutex::new(HashSet::new()));

fn load_words() -> MutexGuard<'static, HashSet<String>> {
    if WORDS.lock().unwrap().is_empty() {
        let text = std::fs::read_to_string("./words.txt").expect("Could not load words.txt");
        let words: Vec<String> = text
            .split('\n')
            .map(std::string::ToString::to_string)
            .collect();
        WORDS.lock().unwrap().extend(words);
    }
    WORDS.lock().unwrap()
}

fn should_react(author_id: u64, content: &str, config: &Arc<Config>) -> bool {
    if !config.blessable_user_ids.contains(&author_id) {
        return false;
    }
    if content.contains(' ') || content.contains('\n') {
        return false;
    }
    let content = Regex::new(r"(?i)[\*_~`!?\\,]")
        .unwrap()
        .replace(content, "")
        .trim()
        .to_owned();
    if content.len() < 8 {
        return false;
    }
    for pattern in PATTERNS.iter() {
        if pattern.is_match(&content) {
            return false;
        }
    }
    if load_words().contains(&content) {
        return false;
    }
    true
}

pub async fn handler(e: &Event, config: &Arc<Config>, http: &Arc<Client>) -> Result<()> {
    if let Event::MessageCreate(event) = e {
        if should_react(event.author.id.get(), &event.content, config) {
            http.create_reaction(
                event.channel_id,
                event.id,
                &RequestReactionType::Unicode { name: "🤧" },
            )
            .await?;
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::should_react;
    use crate::config::Config;
    use std::sync::Arc;

    #[test]
    fn test_should_react() {
        let config = {
            let mut config = Config::default();
            config.blessable_user_ids.push(1);
            Arc::new(config)
        };

        assert!(!should_react(2, "", &config));
        assert!(!should_react(1, "a b", &config));
        assert!(!should_react(1, "a\nb", &config));
        assert!(!should_react(1, "abcdef", &config));
        assert!(!should_react(1, "https://example.com/", &config));
        assert!(!should_react(1, "abdominohysterectomy", &config));

        assert!(should_react(1, "adlfgjlafsgljgakfs", &config));
    }
}
