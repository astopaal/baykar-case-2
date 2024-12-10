import PassengerForm from "../types/PassengerForm";

export const validateForm = (form: PassengerForm): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  if (!form.isim.trim()) errors.isim = "İsim zorunludur";
  if (!form.soyisim.trim()) errors.soyisim = "Soyisim zorunludur";

  if (!form.telefon.trim()) {
    errors.telefon = "Telefon zorunludur";
  } else if (!/^[0-9]{10}$/.test(form.telefon)) {
    errors.telefon = "Geçerli bir telefon numarası giriniz";
  }

  if (!form.eposta.trim()) {
    errors.eposta = "E-posta zorunludur";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.eposta)) {
    errors.eposta = "Geçerli bir e-posta adresi giriniz";
  }

  if (!form.dogumTarihi) errors.dogumTarihi = "Doğum tarihi zorunludur";

  return errors;
};
