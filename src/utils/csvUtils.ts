
type ParsedProduct = {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: string;
  imageUrl: string;
  pricePoints?: string;
  [key: string]: any; // Allow for additional fields
};

/**
 * Parse CSV data into an array of product objects
 * @param csvText CSV text content
 * @returns Array of parsed product objects
 */
export const parseCSV = (csvText: string): ParsedProduct[] => {
  // Split by lines and remove empty lines
  const lines = csvText.split("\n").filter(line => line.trim() !== "");
  if (lines.length < 2) {
    throw new Error("CSV file must contain a header row and at least one data row");
  }

  // Parse the header row to get field names
  const headers = parseCSVLine(lines[0]);

  // Parse each data row
  const products: ParsedProduct[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      try {
        const values = parseCSVLine(line);
        
        // Map values to headers
        const product: ParsedProduct = {} as ParsedProduct;
        headers.forEach((header, index) => {
          product[header.trim().toLowerCase()] = values[index] || "";
        });
        
        products.push(product);
      } catch (error) {
        console.error(`Error parsing line ${i+1}: ${error}`);
        // Continue parsing other lines
      }
    }
  }

  return products;
};

/**
 * Parse a single CSV line handling quoted values and commas within fields
 * @param line CSV line to parse
 * @returns Array of field values
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = i < line.length - 1 ? line[i + 1] : null;
    
    if (char === '"' && !inQuotes) {
      // Start of quoted field
      inQuotes = true;
    } else if (char === '"' && inQuotes && nextChar === '"') {
      // Escaped quote within quoted field
      current += '"';
      i++; // Skip next quote
    } else if (char === '"' && inQuotes) {
      // End of quoted field
      inQuotes = false;
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = "";
    } else {
      // Regular character
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  
  return result;
};
