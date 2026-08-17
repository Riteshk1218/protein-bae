import { getTruckById } from './trucks.js'

export function serializeOrder(row) {
  const truck = row.truck_id ? getTruckById(row.truck_id) : null
  return {
    ...row,
    items: JSON.parse(row.items_json),
    items_json: undefined,
    truck: truck
      ? { id: truck.id, name: truck.name, phone: truck.phone, address: truck.address }
      : null,
  }
}
