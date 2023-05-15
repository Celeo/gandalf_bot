use anyhow::Result;
use once_cell::sync::Lazy;
use std::sync::{Arc, Mutex};
use twilight_gateway::Event;
use twilight_http::Client as HttpClient;

use crate::config::Config;

static WORDS: Lazy<Mutex<Vec<String>>> = Lazy::new(|| Mutex::new(Vec::new()));

fn load_words() -> Vec<String> {
    if WORDS.lock().unwrap().is_empty() {
        let text = std::fs::read_to_string("./words.txt").expect("Could not load words.txt");
        let mut words: Vec<String> = text.split('\n').map(|s| s.to_string()).collect();
        WORDS.lock().unwrap().append(&mut words);
    }
    WORDS.lock().unwrap().to_vec()
}

async fn bless_you(
    config: Arc<Config>,
    e: Event,
    http: Arc<HttpClient>,
    bot_id: u64,
) -> Result<()> {
    todo!()
}
