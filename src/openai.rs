use crate::config::Config;
use anyhow::{anyhow, bail, Result};
use log::error;
use reqwest::Client;
use serde::Deserialize;
use serde_json::json;

#[derive(Debug, Deserialize)]
struct ResponseContent {
    text: String,
}

#[derive(Debug, Deserialize)]
struct ResponseOutput {
    content: Vec<ResponseContent>,
}

#[derive(Debug, Deserialize)]
struct ResponseData {
    output: Vec<ResponseOutput>,
}

/// Query the LLM for a summarization.
pub async fn summarize(config: &Config, input: &str) -> Result<String> {
    let resp = Client::new()
        .post("https://api.openai.com/v1/responses")
        .header("Authorization", format!("Bearer {}", config.openai_key))
        .json(&json!({
            "model": "gpt-4o-mini",
            "store": false,
            "instructions": "Summarize the input to one sentence",
            "temperature": 0.3,
            "input": input
        }))
        .send()
        .await?;
    if !resp.status().is_success() {
        let status_code = resp.status().as_u16();
        error!(
            "Got status {status_code} from OpenAI: {}",
            resp.text().await.unwrap_or_default()
        );
        bail!("Got status {status_code} from OpenAI");
    }
    let data: ResponseData = resp.json().await?;
    let text = data
        .output
        .first()
        .ok_or_else(|| anyhow!("No output"))?
        .content
        .first()
        .ok_or_else(|| anyhow!("No content"))?
        .text
        .clone();
    Ok(text)
}
