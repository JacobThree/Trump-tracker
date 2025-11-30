# Data Sources

This project uses the [FRED API](https://fred.stlouisfed.org/docs/api/fred/) to fetch economic indicators.

## Series Used

| Metric | FRED Series ID | Source | Description |
| :--- | :--- | :--- | :--- |
| **CPI (YoY)** | [CPIAUCSL](https://fred.stlouisfed.org/series/CPIAUCSL) | BLS | Consumer Price Index for All Urban Consumers: All Items in U.S. City Average. We calculate the Year-over-Year percent change (`units=pc1`). |
| **Real GDP** | [A191RL1Q225SBEA](https://fred.stlouisfed.org/series/A191RL1Q225SBEA) | BEA | Real Gross Domestic Product, Percent Change from Preceding Period, Seasonally Adjusted Annual Rate. |
| **Unemployment** | [UNRATE](https://fred.stlouisfed.org/series/UNRATE) | BLS | Unemployment Rate (U-3), Seasonally Adjusted. |

## Configuration

API keys and proxy settings are defined in `assets/js/config.js`.
Data fetching logic is in `assets/js/data.js`.
Chart rendering logic is in `assets/js/charts.js`.
