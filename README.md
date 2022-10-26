## Medusa-plugin-stats

![banner image](./banner.png)

`medusa-plugin-stats` is MedusaJS plugin to retreive store statistics data.

⚠️ Note - Plugin only tested for Postgres DB, and under active development.

## Installation & Usage

1. Run - `yarn add medusa-plugin-stats` or `npm install medusa-plugin-stats`

2. Add plugin to your medusa-config.js - 

```js
plugins: [
  ...
  `medusa-plugin-stats`
  ]
```
3. GET `/admin/stats` with following params will return the statictics data

Query params -> 
```js
{
  entity:[ "sales", "products", "orders", "customers"],
  start: "02-24-2022" // start date in MM-dd-yyyy format,
  end: "11-24-2022" // end date in MM-dd-yyyy format,
  period: "day" // day | week | month | year
}
```

Response -> 
```json
{
    "stats": {
        "sales": {
            "timeseries": {
                "10-20-2022": 1000
            },
            "metrics": {
                "total": 1000
            },
            "period": "day"
        },
        "products": {
            "timeseries": {
                "10-22-2022": 7
            },
            "metrics": {
                "total": "7"
            },
            "period": "day"
        },
        "orders": {
            "timeseries": {
                "10-20-2022": 1,
                "10-22-2022": 1,
                "10-25-2022": 1
            },
            "metrics": {
                "total": "3"
            },
            "period": "day"
        }
    }
}
```

## Devlopment

- [x] Refactor API to allow options to each resource type

- [x] Add time series stats

- [ ] Add more stat metrics & dimensions. Required Suggestions

- [ ] Improve sales stat to allow multiple currencies

