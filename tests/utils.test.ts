import { describe, it, expect } from "vitest";

describe("Utility Functions", () => {
  describe("Slug Generation", () => {
    it("should generate slug with name, timestamp, and random string", () => {
      const generateSlug = (name: string): string => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${name.toLowerCase().replace(/\s+/g, "-").substring(0, 20)}-${timestamp}-${random}`;
      };

      const slug = generateSlug("John Doe Memorial");

      expect(slug).toMatch(/^john-doe-memorial-\d+-[a-z0-9]{6}$/);
      expect(slug.split("-").length).toBeGreaterThanOrEqual(3);
    });

    it("should truncate long names to 20 characters", () => {
      const generateSlug = (name: string): string => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${name.toLowerCase().replace(/\s+/g, "-").substring(0, 20)}-${timestamp}-${random}`;
      };

      const longName = "This is a very long memorial name that exceeds twenty characters";
      const slug = generateSlug(longName);

      const namePart = slug.split("-").slice(0, -2).join("-");
      expect(namePart.length).toBeLessThanOrEqual(20);
    });

    it("should replace spaces with hyphens", () => {
      const generateSlug = (name: string): string => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${name.toLowerCase().replace(/\s+/g, "-").substring(0, 20)}-${timestamp}-${random}`;
      };

      const slug = generateSlug("John Doe Memorial");

      expect(slug).not.toContain(" ");
      expect(slug).toContain("john-doe-memorial");
    });

    it("should generate unique slugs for same name", () => {
      const generateSlug = (name: string): string => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${name.toLowerCase().replace(/\s+/g, "-").substring(0, 20)}-${timestamp}-${random}`;
      };

      const slug1 = generateSlug("Test Memorial");
      const slug2 = generateSlug("Test Memorial");

      expect(slug1).not.toBe(slug2);
    });
  });

  describe("Date Formatting", () => {
    it("should format date to ISO string", () => {
      const date = new Date("2024-01-15T10:30:00.000Z");
      const isoString = date.toISOString();

      expect(isoString).toBe("2024-01-15T10:30:00.000Z");
    });

    it("should parse ISO date string", () => {
      const isoString = "2024-01-15T10:30:00.000Z";
      const date = new Date(isoString);

      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(15);
    });

    it("should calculate age from birth date", () => {
      const calculateAge = (birthDate: Date): number => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        return age;
      };

      const birthDate = new Date("1990-01-15");
      const age = calculateAge(birthDate);

      expect(age).toBeGreaterThan(30);
      expect(typeof age).toBe("number");
    });
  });

  describe("String Utilities", () => {
    it("should capitalize first letter", () => {
      const capitalize = (str: string): string => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };

      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("WORLD")).toBe("World");
      expect(capitalize("test")).toBe("Test");
    });

    it("should truncate long strings", () => {
      const truncate = (str: string, maxLength: number): string => {
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength - 3) + "...";
      };

      expect(truncate("Short", 10)).toBe("Short");
      expect(truncate("This is a very long string", 10)).toBe("This is...");
    });

    it("should sanitize input strings", () => {
      const sanitize = (str: string): string => {
        return str.trim().replace(/\s+/g, " ");
      };

      expect(sanitize("  hello   world  ")).toBe("hello world");
      expect(sanitize("test\n\nmultiline")).toBe("test multiline");
    });
  });

  describe("Array Utilities", () => {
    it("should chunk array into smaller arrays", () => {
      const chunk = <T>(array: T[], size: number): T[][] => {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
          chunks.push(array.slice(i, i + size));
        }
        return chunks;
      };

      const arr = [1, 2, 3, 4, 5, 6, 7, 8];
      const chunked = chunk(arr, 3);

      expect(chunked).toEqual([[1, 2, 3], [4, 5, 6], [7, 8]]);
    });

    it("should remove duplicates from array", () => {
      const unique = <T>(array: T[]): T[] => {
        return Array.from(new Set(array));
      };

      expect(unique([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
      expect(unique(["a", "b", "a", "c"])).toEqual(["a", "b", "c"]);
    });

    it("should group array by key", () => {
      const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
        return array.reduce((acc, item) => {
          const groupKey = String(item[key]);
          if (!acc[groupKey]) acc[groupKey] = [];
          acc[groupKey].push(item);
          return acc;
        }, {} as Record<string, T[]>);
      };

      const items = [
        { type: "A", value: 1 },
        { type: "B", value: 2 },
        { type: "A", value: 3 },
      ];

      const grouped = groupBy(items, "type");

      expect(grouped.A).toHaveLength(2);
      expect(grouped.B).toHaveLength(1);
    });
  });

  describe("Object Utilities", () => {
    it("should deep clone object", () => {
      const deepClone = <T>(obj: T): T => {
        return JSON.parse(JSON.stringify(obj));
      };

      const original = { name: "Test", nested: { value: 123 } };
      const cloned = deepClone(original);

      cloned.nested.value = 456;

      expect(original.nested.value).toBe(123);
      expect(cloned.nested.value).toBe(456);
    });

    it("should pick specific keys from object", () => {
      const pick = <T extends object, K extends keyof T>(
        obj: T,
        keys: K[]
      ): Pick<T, K> => {
        const result = {} as Pick<T, K>;
        keys.forEach(key => {
          if (key in obj) result[key] = obj[key];
        });
        return result;
      };

      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const picked = pick(obj, ["a", "c"]);

      expect(picked).toEqual({ a: 1, c: 3 });
    });

    it("should omit specific keys from object", () => {
      const omit = <T extends object, K extends keyof T>(
        obj: T,
        keys: K[]
      ): Omit<T, K> => {
        const result = { ...obj };
        keys.forEach(key => delete result[key]);
        return result;
      };

      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const omitted = omit(obj, ["b", "d"]);

      expect(omitted).toEqual({ a: 1, c: 3 });
    });
  });

  describe("Validation Utilities", () => {
    it("should validate required fields", () => {
      const validateRequired = (
        obj: Record<string, any>,
        fields: string[]
      ): { valid: boolean; missing: string[] } => {
        const missing = fields.filter(field => !obj[field]);
        return { valid: missing.length === 0, missing };
      };

      const data = { name: "Test", email: "test@example.com" };
      const result = validateRequired(data, ["name", "email", "phone"]);

      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(["phone"]);
    });

    it("should check if value is empty", () => {
      const isEmpty = (value: any): boolean => {
        if (value == null) return true;
        if (typeof value === "string") return value.trim().length === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === "object") return Object.keys(value).length === 0;
        return false;
      };

      expect(isEmpty(null)).toBe(true);
      expect(isEmpty("")).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty("test")).toBe(false);
      expect(isEmpty([1])).toBe(false);
    });
  });

  describe("Number Utilities", () => {
    it("should format currency", () => {
      const formatCurrency = (amount: number, currency = "BRL"): string => {
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency,
        }).format(amount);
      };

      expect(formatCurrency(1234.56)).toContain("1.234,56");
    });

    it("should clamp number between min and max", () => {
      const clamp = (num: number, min: number, max: number): number => {
        return Math.min(Math.max(num, min), max);
      };

      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("should generate random number in range", () => {
      const randomInRange = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      const num = randomInRange(1, 10);
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(10);
    });
  });
});
