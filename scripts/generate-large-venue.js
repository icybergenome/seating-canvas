/**
 * Generates a large venue configuration for performance testing
 * @author Bilal S.
 * @returns {Object} A venue object with 15,000+ seats across multiple sections
 */
const generateLargeVenue = () => {
  const venue = {
    venueId: "stadium-megadome",
    name: "MegaDome Stadium - 15K+ Seats",
    map: { width: 2000, height: 1500 },
    sections: []
  };

  const seatStatuses = ['available', 'reserved', 'sold', 'held'];
  const priceTiers = [1, 2, 3];
  
  let seatCounter = 0;
  const sectionsConfig = [
    { id: 'LOWER_A', label: 'Lower Bowl A', transform: { x: 100, y: 200 }, rows: 40, seatsPerRow: 50 },
    { id: 'LOWER_B', label: 'Lower Bowl B', transform: { x: 100, y: 800 }, rows: 40, seatsPerRow: 50 },
    { id: 'UPPER_A', label: 'Upper Bowl A', transform: { x: 100, y: 100 }, rows: 30, seatsPerRow: 60 },
    { id: 'UPPER_B', label: 'Upper Bowl B', transform: { x: 100, y: 900 }, rows: 30, seatsPerRow: 60 },
    { id: 'CLUB_A', label: 'Club Level A', transform: { x: 200, y: 300 }, rows: 20, seatsPerRow: 40 },
    { id: 'CLUB_B', label: 'Club Level B', transform: { x: 200, y: 700 }, rows: 20, seatsPerRow: 40 },
    { id: 'PREMIUM_A', label: 'Premium Section A', transform: { x: 300, y: 400 }, rows: 15, seatsPerRow: 30 },
    { id: 'PREMIUM_B', label: 'Premium Section B', transform: { x: 300, y: 600 }, rows: 15, seatsPerRow: 30 },
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
          x: seatIndex * 25 + (rowIndex % 2) * 12.5, // Slightly stagger seats for realism
          y: rowIndex * 20,
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
