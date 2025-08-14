import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const maintenanceJobs = [
  { name: "ABS System Repair & Calibration", category: "Brakes", parts: "ABS sensors, wiring, ECU", notes: "Annual or as needed" },
  { name: "Accessory Installation (GPS, dashcam)", category: "Electrical", parts: "GPS unit, wiring, mounts", notes: "Optional" },
  { name: "Air Bag Suspension Replacement", category: "Suspension", parts: "Airbags, leveling valve, airlines", notes: "3–5 years or if leaking" },
  { name: "Air Compressor Repair", category: "Brakes", parts: "Compressor, gaskets, air filter", notes: "2–4 years" },
  { name: "Air Dryer Service", category: "Brakes", parts: "Air dryer cartridge, seals", notes: "Annually" },
  { name: "Air Hose & Coupler Replacement", category: "Brakes", parts: "Service line, emergency line, gladhand", notes: "As needed" },
  { name: "Air Tank Drain & Replacement", category: "Brakes", parts: "Air tank, drain valve", notes: "Drain daily; replace if corroded" },
  { name: "Alignment (Axle/Wheel/Trailer)", category: "Suspension", parts: "Alignment shims, tools", notes: "Every 6–12 months" },
  { name: "Alternator Replacement", category: "Electrical", parts: "Alternator, belt", notes: "3–5 years" },
  { name: "Axle Bearing Service", category: "Suspension", parts: "Bearings, grease seals", notes: "Annually" },
  { name: "Axle Seat Welding", category: "Welding", parts: "Welding rods, brackets", notes: "As needed" },
  { name: "Axle Shaft Replacement", category: "Suspension", parts: "Shaft, bearings", notes: "As needed" },
  { name: "Battery Isolator Switch Service", category: "Electrical", parts: "Switch, wiring", notes: "As needed" },
  { name: "Battery Service", category: "Electrical", parts: "Battery, terminals", notes: "1–2 years" },
  { name: "Body Frame Welding", category: "Welding", parts: "MIG/Stick welding equipment", notes: "As needed" },
  { name: "Brake Chamber Replacement", category: "Brakes", parts: "Brake chamber, push rod", notes: "3–5 years" },
  { name: "Brake Drum / Disc Replacement", category: "Brakes", parts: "Drums, rotors", notes: "3–5 years" },
  { name: "Brake Lining / Pad Replacement", category: "Brakes", parts: "Shoes, pads, return springs", notes: "1–2 years" },
  { name: "Brake Shoe Anchor Pin Bushing Replacement", category: "Brakes", parts: "Pins, bushings", notes: "As needed" },
  { name: "Brake Stroke Measurement", category: "Brakes", parts: "Measurement tool", notes: "Every service" },
  { name: "Brake Valve Service", category: "Brakes", parts: "Relay valve, quick release valve", notes: "3–5 years" },
  { name: "Bushings Replacement", category: "Suspension", parts: "Rubber/PU bushings", notes: "2–4 years" },
  { name: "Cab Mount Replacement", category: "Body", parts: "Cab mounts, bolts", notes: "5–7 years" },
  { name: "Cargo Door Seal Replacement", category: "Body", parts: "Rubber seals, adhesive", notes: "As needed" },
  { name: "Chassis Crack Welding", category: "Welding", parts: "Stick welding rods, reinforcement plates", notes: "As needed" },
  { name: "Clutch Service", category: "Drivetrain", parts: "Clutch plate, release bearing", notes: "3–6 years" },
  { name: "Coolant Flush & Leak Repair", category: "Cooling", parts: "Coolant, hoses, clamps", notes: "2 years" },
  { name: "Coupler Height Adjustment", category: "Trailer Coupling", parts: "Spacers, bolts", notes: "As needed" },
  { name: "Crankshaft Seal Replacement", category: "Engine", parts: "Seals", notes: "As needed" },
  { name: "Crossmember Welding / Replacement", category: "Welding", parts: "MIG/Stick rods, crossmember steel", notes: "As needed" },
  { name: "Differential Overhaul", category: "Drivetrain", parts: "Bearings, gears, seals", notes: "5–8 years" },
  { name: "Door Roller Track Welding", category: "Welding", parts: "Track, welding rods", notes: "As needed" },
  { name: "Driveshaft Replacement", category: "Drivetrain", parts: "Driveshaft, U-joints", notes: "As needed" },
  { name: "ECU Software Updates", category: "Electrical", parts: "Diagnostic tool", notes: "As needed" },
  { name: "EGR Cooler Cleaning / Replacement", category: "Engine", parts: "EGR cooler, gaskets", notes: "As needed" },
  { name: "Electrical Harness Repair", category: "Electrical", parts: "Wires, connectors", notes: "As needed" },
  { name: "Engine Overhaul", category: "Engine", parts: "Pistons, bearings, gaskets", notes: "8–12 years" },
  { name: "Exhaust Flex Pipe Replacement", category: "Exhaust", parts: "Flex pipe, clamps", notes: "As needed" },
  { name: "Fan Belt Tensioner Replacement", category: "Engine", parts: "Tensioner, bolts", notes: "As needed" },
  { name: "Fifth Wheel Welding & Adjustment", category: "Welding/Coupling", parts: "Welding rods, pins, lock jaw", notes: "Annually" },
  { name: "Floor Panel Replacement (Trailer)", category: "Body", parts: "Wooden/steel flooring", notes: "As needed" },
  { name: "Frame Reinforcement", category: "Welding", parts: "Steel plates, MIG/Stick welding", notes: "As needed" },
  { name: "Fuel Filter Change", category: "Fuel System", parts: "Filters", notes: "6–12 months" },
  { name: "Fuel Line Replacement", category: "Fuel System", parts: "Fuel hose, clamps", notes: "As needed" },
  { name: "Fuel Pump Repair / Replacement", category: "Fuel System", parts: "Pump, gaskets", notes: "As needed" },
  { name: "Fuel Tank Welding (if steel)", category: "Welding", parts: "TIG/MIG welding", notes: "As needed" },
  { name: "Gladhand Seal Replacement", category: "Brakes", parts: "Rubber seals", notes: "As needed" },
  { name: "Greasing & Lubrication Service", category: "General", parts: "Grease, grease gun", notes: "Monthly" },
  { name: "Hatch / Manhole Seal Replacement", category: "Tanker Trailer", parts: "Rubber seals", notes: "As needed" },
  { name: "Headlight Replacement", category: "Electrical", parts: "Bulb, housing", notes: "As needed" },
  { name: "Heater Core Flush", category: "Cooling/Heating", parts: "Flush tool, hoses", notes: "As needed" },
  { name: "Hydraulic Cylinder Rebuild", category: "Hydraulics", parts: "Seals, cylinder rod", notes: "3–6 years" },
  { name: "Hydraulic Filter Replacement", category: "Hydraulics", parts: "Filter, seals", notes: "Annually" },
  { name: "Hydraulic Hose Replacement", category: "Hydraulics", parts: "Hydraulic hose, fittings", notes: "As needed" },
  { name: "Intercooler Cleaning & Leak Repair", category: "Engine", parts: "Intercooler, clamps", notes: "As needed" },
  { name: "Kingpin Replacement", category: "Coupling", parts: "Kingpin, welds", notes: "5–8 years" },
  { name: "Landing Gear Pad Welding", category: "Welding", parts: "Pads, rods", notes: "As needed" },
  { name: "Landing Gear Repair", category: "Trailer Body", parts: "Legs, gears, welds", notes: "3–5 years" },
  { name: "Lashing Ring or Tie-Down Anchor Welding", category: "Welding", parts: "Anchor ring, weld", notes: "As needed" },
  { name: "Leaf Spring Replacement", category: "Suspension", parts: "Leaf packs, U-bolts", notes: "3–6 years" },
  { name: "Lighting Wiring Harness Repair", category: "Electrical", parts: "Wires, connectors", notes: "As needed" },
  { name: "Load Sensor Calibration", category: "Suspension", parts: "Sensor, software", notes: "Annually" },
  { name: "Marker Light Replacement", category: "Electrical", parts: "Light unit, wiring", notes: "As needed" },
  { name: "Mudflap Bracket Welding", category: "Welding", parts: "Bracket, weld", notes: "As needed" },
  { name: "Oil & Filter Change", category: "Engine", parts: "Oil, filters", notes: "15–20k km" },
  { name: "Oil Cooler Cleaning / Replacement", category: "Engine", parts: "Oil cooler, gaskets", notes: "As needed" },
  { name: "Paint & Rust Protection", category: "Body", parts: "Paint, primer", notes: "Every 2–3 years" },
  { name: "Parking Brake Adjustment", category: "Brakes", parts: "Brake linkage", notes: "6–12 months" },
  { name: "PTO (Power Take-Off) Service", category: "Hydraulics", parts: "PTO unit, seals", notes: "2–5 years" },
  { name: "Radiator Cap Pressure Check / Replacement", category: "Cooling", parts: "Cap", notes: "Annually" },
  { name: "Reflector Replacement", category: "Body", parts: "Reflectors, adhesive", notes: "As needed" },
  { name: "Roof Panel Welding (Trailer)", category: "Welding", parts: "Panel, MIG rods", notes: "As needed" },
  { name: "SCR System Service (AdBlue/DEF)", category: "Exhaust", parts: "DEF injector, filters", notes: "Annually" },
  { name: "Seasonal Inspection (Winter/Summer Prep)", category: "Preventive", parts: "Coolant, wipers, tires", notes: "Every 6 months" },
  { name: "Sensor Diagnostics & Replacement", category: "Electrical", parts: "Sensors", notes: "As needed" },
  { name: "Shock Absorber Replacement", category: "Suspension", parts: "Shock absorber, bushings", notes: "2–4 years" },
  { name: "Side Curtain Track Replacement", category: "Trailer Body", parts: "Track, rollers", notes: "As needed" },
  { name: "Side Rail Welding", category: "Welding", parts: "Rails, rods", notes: "As needed" },
  { name: "Sliding Tandem Lock Repair", category: "Suspension", parts: "Locking pins, springs", notes: "As needed" },
  { name: "Spare Tire Carrier Welding", category: "Welding", parts: "Carrier frame, rods", notes: "As needed" },
  { name: "Starter Motor Repair / Replacement", category: "Electrical", parts: "Starter, solenoid", notes: "As needed" },
  { name: "Steering Linkage Replacement", category: "Steering", parts: "Tie rods, drag link", notes: "2–5 years" },
  { name: "Suspension Hanger Bracket Welding", category: "Welding", parts: "Hanger bracket, rods", notes: "As needed" },
  { name: "Suspension Leveling Valve Replacement", category: "Suspension", parts: "Valve, fittings", notes: "As needed" },
  { name: "Tail Light Replacement", category: "Electrical", parts: "Light assembly", notes: "As needed" },
  { name: "Tanker Internal Cleaning", category: "Tanker Trailer", parts: "Cleaning tools", notes: "Periodic" },
  { name: "Tie Rod End Replacement", category: "Steering", parts: "Tie rod end, grease", notes: "2–4 years" },
  { name: "Tire Rotation & Balancing", category: "Tires", parts: "Tires, weights", notes: "6–12 months" },
  { name: "Tire Replacement", category: "Tires", parts: "Tires", notes: "As needed" },
  { name: "Tool Box Welding", category: "Welding", parts: "Brackets, rods", notes: "As needed" },
  { name: "Torque Arm Bushing Replacement", category: "Suspension", parts: "Bushings, bolts", notes: "As needed" },
  { name: "Torque Check on Wheel Nuts", category: "Tires", parts: "Torque wrench", notes: "Every wheel service" },
  { name: "Trailer ABS Module Service", category: "Brakes", parts: "ABS ECU, harness", notes: "As needed" },
  { name: "Trailer Door Roller Replacement", category: "Body", parts: "Rollers, tracks", notes: "As needed" },
  { name: "Trailer Roof Bow Replacement", category: "Body", parts: "Roof bows", notes: "As needed" },
  { name: "Transmission Overhaul", category: "Drivetrain", parts: "Bearings, gears", notes: "8–12 years" },
  { name: "Turbocharger Replacement", category: "Engine", parts: "Turbo unit, gaskets", notes: "As needed" },
  { name: "Universal Joint Replacement", category: "Drivetrain", parts: "U-joints", notes: "3–5 years" },
  { name: "Undercoating & Anti-Rust", category: "Body", parts: "Undercoat spray", notes: "Every 2–3 years" },
  { name: "Valve Adjustment", category: "Engine", parts: "Valve shims", notes: "Annually" },
  { name: "Water Pump Replacement", category: "Cooling", parts: "Pump, gaskets", notes: "4–6 years" },
  { name: "Welding Repairs – General", category: "Welding", parts: "MIG, Stick, TIG tools", notes: "As needed" },
  { name: "Wheel Bearing Greasing", category: "Tires/Suspension", parts: "Bearings, grease", notes: "Annually" },
  { name: "Wheel Rim Welding (steel)", category: "Welding", parts: "MIG/Stick rods", notes: "As needed" },
  { name: "Wheel Stud & Nut Replacement", category: "Tires", parts: "Studs, nuts", notes: "As needed" },
  { name: "Windshield Replacement", category: "Body", parts: "Glass, seal", notes: "As needed" },
  { name: "Winch Cable Replacement & Drum Service", category: "Recovery/Equipment", parts: "Cable, drum, bearings", notes: "As needed" },
  { name: "Wiper Motor Replacement", category: "Electrical", parts: "Motor, linkage", notes: "As needed" }
]

async function main() {
  console.log('Seeding maintenance jobs...')
  
  // First, clear existing jobs (optional - remove if you want to keep existing data)
  await prisma.maintenanceJob.deleteMany()
  
  // Create all jobs
  for (const job of maintenanceJobs) {
    await prisma.maintenanceJob.create({
      data: job
    })
  }
  
  console.log('Maintenance jobs seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })