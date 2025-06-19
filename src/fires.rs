use crate::config::Config;
use anyhow::{bail, Result};
use serde::{Deserialize, Serialize};
use std::f64::consts::PI;

const MAXIMUM_FIRE_DISTANCE: f64 = 30.0;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct FireData {
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Updated")]
    pub updated: String,
    #[serde(rename = "Started")]
    pub started: String,
    #[serde(rename = "County")]
    pub county: String,
    #[serde(rename = "Location")]
    pub location: String,
    #[serde(rename = "AcresBurned")]
    pub acres_burned: f64,
    #[serde(rename = "PercentContained")]
    pub percent_contained: Option<f64>,
    #[serde(rename = "Longitude")]
    pub longitude: f64,
    #[serde(rename = "Latitude")]
    pub latitude: f64,
    #[serde(rename = "Type")]
    pub type_of_fire: String,
    #[serde(rename = "Url")]
    pub url: String,
}

/// Get data from CA Fire's API.
///
/// Returned fires, if any, are filtered to a maximum distance from
/// the config's home location.
pub async fn get_fire_data(config: &Config) -> Result<Vec<FireData>> {
    let client = reqwest::ClientBuilder::new()
        .user_agent("github.com/celeo/gandalf_bot")
        .build()
        .unwrap();
    let response = client
        .get("https://incidents.fire.ca.gov/umbraco/api/IncidentApi/List?inactive=false")
        .send()
        .await?;
    if !response.status().is_success() {
        bail!("Got status {} from fire API", response.status().as_u16());
    }
    let data: Vec<FireData> = response.json().await?;
    let data = data
        .iter()
        .filter(|fire| {
            let distance = haversine(
                fire.latitude,
                fire.longitude,
                config.home.lat,
                config.home.lon,
            );
            distance <= MAXIMUM_FIRE_DISTANCE
        })
        .cloned()
        .collect();
    Ok(data)
}

pub fn haversine(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    let r = 6371e3;
    let φ1 = (lat1 * PI) / 180_f64;
    let φ2 = (lat2 * PI) / 180_f64;
    #[allow(non_snake_case)]
    let Δφ = ((lat2 - lat1) * PI) / 180_f64;
    #[allow(non_snake_case)]
    let Δλ = ((lon2 - lon1) * PI) / 180_f64;
    let a = f64::sin(Δφ / 2_f64) * f64::sin(Δφ / 2_f64)
        + f64::cos(φ1) * f64::cos(φ2) * f64::sin(Δλ / 2_f64) * f64::sin(Δλ / 2_f64);
    let c = 2_f64 * f64::atan2(f64::sqrt(a), f64::sqrt(1_f64 - a));
    let d = r * c;
    f64::round(d * 0.00054)
}
