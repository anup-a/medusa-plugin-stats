## Medusa-plugin-stats

![banner image](./banner.png)

`medusa-plugin-stats` is MedusaJS plugin to retreive store statistics data.

⚠️ Note - This plugin is under active development,and will introduce few changes in API.

## Installation & Usage

1. Run - `yarn add medusa-plugin-stats` or `npm install medusa-plugin-stats`

2. Add plugin to your medusa-config.js - 

```js
plugins: [
  ...
  `medusa-plugin-stats`
  ]
```
3. GET /admin/stats with following params returns the statictics data

Query params -> 
```json
{
  entity: ["sales", "products", 'orders", 'customers'],
  start: "02/24/2022" // start date in MM/dd/yyyy format,
  end: "11/24/2022" // end date in MM/dd/yyyy format,
}
```

Response -> 
```json
{
  "sales": [],
  "products": [],
  "customers": [],
  "orders": []
}
```

## Devlopment

[] Refactor API to allow options to each resource type

[] Add mean & time series stats

[] Improve sales stat to allow multiple currencies
