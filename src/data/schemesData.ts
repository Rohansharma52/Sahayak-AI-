export type SchemeType = "free" | "loan" | "insurance" | "subsidy" | "pension" | "training";
export type SchemeLevel = "central" | "state" | "private";

export interface SchemeStep {
  no: number;
  title: string; titleHi: string;
  desc: string;  descHi: string;
}

export interface Scheme {
  id: string;
  name: string; nameHi: string;
  emoji: string;
  type: SchemeType;
  level: SchemeLevel;
  benefit: string; benefitHi: string;
  amount: string;
  eligibility: {
    landMin?: number; landMax?: number;
    ageMin?: number;  ageMax?: number;
    categories: string[];
    farmerType: string[];
    states: string[];
  };
  desc: string; descHi: string;
  steps: SchemeStep[];
  docs: string[]; docsHi: string[];
  link: string;
  helpline: string;
  tags: string[];
}
