## Medusa-plugin-stats

![banner image](./banner.png)

`medusa-plugin-stats` is MedusaJS plugin to retreive store statistics data.


## Installation

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
