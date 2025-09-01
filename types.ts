export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  address: string;
  photo: string;
}

export interface Position {
  id: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface CompanyExperience {
  id: string;
  company: string;
  location: string;
  positions: Position[];
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  graduationDate: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: CompanyExperience[];
  education: Education[];
  skills: string[];
}