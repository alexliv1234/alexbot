#!/usr/bin/env node

// Find years that are leap years in BOTH Hebrew and Gregorian calendars

function isGregorianLeap(year) {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  if (year % 4 === 0) return true;
  return false;
}

function isHebrewLeap(hebrewYear) {
  // Hebrew calendar uses 19-year Metonic cycle
  // Years 3, 6, 8, 11, 14, 17, 19 of each cycle are leap years
  const yearInCycle = hebrewYear % 19;
  return [3, 6, 8, 11, 14, 17, 0].includes(yearInCycle); // 0 = 19th year
}

function gregorianToHebrew(gregorianYear) {
  // Approximate conversion (Hebrew year starts in fall)
  // Hebrew year 5786 = Gregorian 2025-2026
  return gregorianYear + 3760;
}

const startYear = 2026;
const dualLeapYears = [];

for (let year = startYear; dualLeapYears.length < 100; year++) {
  const hebrewYear = gregorianToHebrew(year);
  
  if (isGregorianLeap(year) && isHebrewLeap(hebrewYear)) {
    dualLeapYears.push(`${year} (${hebrewYear})`);
  }
}

console.log('🗓️ 100 השנים הבאות שמעוברות בשני הלוחות:\n');
dualLeapYears.forEach((year, i) => {
  console.log(`${i + 1}. ${year}`);
});

console.log(`\nהשנה הראשונה: ${dualLeapYears[0]}`);
console.log(`השנה ה-100: ${dualLeapYears[99]}`);
