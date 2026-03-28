import Papa from "papaparse";
import { csvProductSchema } from "@/lib/validations";

export interface ParseResult {
  valid: Array<{
    name: string;
    description: string;
    category: string;
    originalPrice: number;
    affiliateLink: string;
    imageURL: string;
    marginPercent: number;
    sourcePlatform: string;
    commissionRate: number;
  }>;
  errors: Array<{ row: number; errors: string[] }>;
  totalRows: number;
}

const columnMappings: Record<string, string> = {
  title: "name",
  product_name: "name",
  product: "name",
  price: "originalPrice",
  cost: "originalPrice",
  original_price: "originalPrice",
  base_price: "originalPrice",
  link: "affiliateLink",
  url: "affiliateLink",
  affiliate_link: "affiliateLink",
  affiliate_url: "affiliateLink",
  desc: "description",
  image: "imageURL",
  image_url: "imageURL",
  img: "imageURL",
  margin: "marginPercent",
  margin_percent: "marginPercent",
  source: "sourcePlatform",
  platform: "sourcePlatform",
  commission: "commissionRate",
};

function mapColumnName(col: string): string {
  const normalized = col.toLowerCase().trim().replace(/\s+/g, "_");
  return columnMappings[normalized] || normalized;
}

export async function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const valid: ParseResult["valid"] = [];
        const errors: ParseResult["errors"] = [];

        results.data.forEach((rawRow: unknown, index: number) => {
          const row = rawRow as Record<string, string>;
          const mapped: Record<string, unknown> = {};
          Object.entries(row).forEach(([key, value]) => {
            mapped[mapColumnName(key)] = value;
          });

          const result = csvProductSchema.safeParse(mapped);
          if (result.success) {
            valid.push(result.data);
          } else {
            errors.push({
              row: index + 2,
              errors: result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
            });
          }
        });

        resolve({ valid, errors, totalRows: results.data.length });
      },
    });
  });
}
