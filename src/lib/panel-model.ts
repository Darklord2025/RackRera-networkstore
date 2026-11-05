export interface AccountProfile {
  kind: "personal" | "company";
  name: string;
  company: string;
  nationalId: string;
  economicCode: string;
  registrationNumber: string;
  postalCode: string;
  address: string;
  email: string;
  username: string;
}
export const emptyProfile: AccountProfile = {
  kind: "personal",
  name: "",
  company: "",
  nationalId: "",
  economicCode: "",
  registrationNumber: "",
  postalCode: "",
  address: "",
  email: "",
  username: "",
};
