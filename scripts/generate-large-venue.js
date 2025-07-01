/**
 * Generates a large venue configuration for performance testing
 * @author Bilal S.
 * @returns {Object} A venue object with 15,000+ seats across multiple sections
 */
const generateLargeVenue = () => {
  const venue = {
    venueId: "stadium-megadome",
    name: "MegaDome Stadium - 15K+ Seats",
    map: { width: 3000, height: 2400 }, // Increased map size for better spacing
    sections: []
  };

  const seatStatuses = ['available', 'reserved', 'sold', 'held'];
  const priceTiers = [1, 2, 3];
  
  let seatCounter = 0;
  // Redesigned layout with better spacing and no overlaps
  const sectionsConfig = [
    // Lower Bowl sections - Left side
    { id: 'LOWER_A', label: 'Lower Bowl A', transform: { x: 200, y: 400 }, rows: 35, seatsPerRow: 45 },
    { id: 'LOWER_B', label: 'Lower Bowl B', transform: { x: 200, y: 1200 }, rows: 35, seatsPerRow: 45 },
    
    // Upper Bowl sections - Higher up, more seats per row
    { id: 'UPPER_A', label: 'Upper Bowl A', transform: { x: 150, y: 150 }, rows: 25, seatsPerRow: 55 },
    { id: 'UPPER_B', label: 'Upper Bowl B', transform: { x: 150, y: 1700 }, rows: 25, seatsPerRow: 55 },
    
    // Club Level - Center sections
    { id: 'CLUB_A', label: 'Club Level A', transform: { x: 1400, y: 500 }, rows: 18, seatsPerRow: 38 },
    { id: 'CLUB_B', label: 'Club Level B', transform: { x: 1400, y: 1100 }, rows: 18, seatsPerRow: 38 },
    
    // Premium sections - Best locations
    { id: 'PREMIUM_A', label: 'Premium Section A', transform: { x: 1800, y: 700 }, rows: 12, seatsPerRow: 25 },
    { id: 'PREMIUM_B', label: 'Premium Section B', transform: { x: 1800, y: 900 }, rows: 12, seatsPerRow: 25 },
    
    // Field Level sections - Close to action
    { id: 'FIELD_A', label: 'Field Level A', transform: { x: 500, y: 800 }, rows: 8, seatsPerRow: 30 },
    { id: 'FIELD_B', label: 'Field Level B', transform: { x: 500, y: 1000 }, rows: 8, seatsPerRow: 30 },
  ];

  sectionsConfig.forEach(sectionConfig => {
    const section = {
      id: sectionConfig.id,
      label: sectionConfig.label,
      transform: sectionConfig.transform,
      rows: []
    };

    for (let rowIndex = 1; rowIndex <= sectionConfig.rows; rowIndex++) {
      const row = {
        index: rowIndex,
        seats: []
      };

      for (let seatIndex = 1; seatIndex <= sectionConfig.seatsPerRow; seatIndex++) {
        const seatId = `${sectionConfig.id}-${rowIndex}-${seatIndex.toString().padStart(2, '0')}`;
        const seat = {
          id: seatId,
          col: seatIndex,
          // Improved spacing: 20px between seats, with slight staggering for realism
          x: seatIndex * 20 + (rowIndex % 2) * 8, 
          // 25px between rows for better vertical spacing
          y: rowIndex * 25,
          priceTier: priceTiers[Math.floor(Math.random() * priceTiers.length)],
          status: seatStatuses[Math.floor(Math.random() * seatStatuses.length)]
        };
        
        row.seats.push(seat);
        seatCounter++;
      }

      section.rows.push(row);
    }

    venue.sections.push(section);
  });

  console.log(`Generated venue with ${seatCounter} seats`);
  return venue;
};

// Generate and write the venue
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const largeVenue = generateLargeVenue();
const filePath = path.join(__dirname, '..', 'public', 'large-venue.json');

fs.writeFileSync(filePath, JSON.stringify(largeVenue, null, 2));
console.log(`Large venue file written to: ${filePath}`);
console.log(`Total seats: ${largeVenue.sections.reduce((total, section) => 
  total + section.rows.reduce((rowTotal, row) => rowTotal + row.seats.length, 0), 0)}`);
