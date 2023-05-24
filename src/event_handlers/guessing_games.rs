use anyhow::Result;
use once_cell::sync::Lazy;
use regex::Regex;
use std::sync::Arc;
use twilight_gateway::Event;
use twilight_http::{request::channel::reaction::RequestReactionType, Client};

static PATTERNS: Lazy<Vec<Regex>> = Lazy::new(|| {
    vec![
        Regex::new(r"Framed #\d+\n🎥 🟩 ⬛ ⬛ ⬛ ⬛ ⬛\n\nhttps://framed.wtf").unwrap(),
        Regex::new(r"#Tradle #\d+ \d+/\d+\n🟩🟩🟩🟩🟩\nhttps://oec.world/en/tradle").unwrap(),
        Regex::new(r"#Heardle #\d+\n\n🔊🟩⬜⬜⬜⬜⬜\n\nhttps://spotify\.com/heardle").unwrap(),
        Regex::new(r"#Tradle \(🇺🇸 Edition\) #\d+ 1/6\n🟩🟩🟩🟩🟩\nhttps://oec.world/en/tradle")
            .unwrap(),
        Regex::new(r"#GuessTheGame #\d+\n\n🎮 🟩 ⬜ ⬜ ⬜ ⬜ ⬜\n\nhttps://GuessThe.Game/")
            .unwrap(),
    ]
});

fn should_react(content: &str) -> bool {
    for pattern in PATTERNS.iter() {
        if pattern.is_match(content) {
            return true;
        }
    }
    false
}

pub async fn handler(e: &Event, http: &Arc<Client>) -> Result<()> {
    if let Event::MessageCreate(event) = e {
        if should_react(&event.content) {
            http.create_reaction(
                event.channel_id,
                event.id,
                &RequestReactionType::Unicode { name: "💯" },
            )
            .await?;
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::should_react;

    #[test]
    fn test_should_react() {
        let yes = &[
            "Framed #223
🎥 🟩 ⬛ ⬛ ⬛ ⬛ ⬛

https://framed.wtf/",
            r#"#GuessTheGame #351

🎮 🟩 ⬜ ⬜ ⬜ ⬜ ⬜

https://GuessThe.Game/"#,
        ];
        let no = &[
            "",
            r#"Framed #223
🎥 🟥 🟥 🟥 🟩 ⬛ ⬛

https://framed.wtf/"#,
            r#"#Tradle #226 3/6
🟩🟩🟩🟩🟨
🟩🟩🟩🟩🟨
🟩🟩🟩🟩🟩
https://oec.world/en/tradle"#,
            r#"#GuessTheGame #350

🎮 🟥 🟥 🟩 ⬜ ⬜ ⬜

https://GuessThe.Game/"#,
        ];

        for y in yes {
            assert!(should_react(y));
        }
        for n in no {
            assert_eq!(should_react(n), false);
        }
    }
}
