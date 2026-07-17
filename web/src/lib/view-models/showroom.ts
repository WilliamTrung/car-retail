export interface ShowroomVM {
  id: string;
  name: string;
  typeTag: "1S" | "2S" | "3S";
  address: string;
  hours: string;
  city: string;
  cityKey: string;
  hotline: string;
  mapsUrl: string;
  imageUrl: string | null;
  bookHref: string;
}
