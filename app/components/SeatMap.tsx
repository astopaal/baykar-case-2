"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";

type Seat = {
    id: number;
    isFull: boolean;
    tooltip: string | null;
};

type SeatMapProps = {
};

type PassengerForm = {
    isim: string;
    soyisim: string;
    telefon: string;
    eposta: string;
    cinsiyet: "Erkek" | "Kadın" | "Diğer";
    dogumTarihi: string;
};

const SeatMap: React.FC<SeatMapProps> = () => {
    const [seats, setSeats] = useState<Seat[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
    const maxPassengers = 3
    const [openAccordion, setOpenAccordion] = useState<number | null>(0);
    const [passengerForms, setPassengerForms] = useState<PassengerForm[]>([]);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }[]>([]);
    const [showModal, setShowModal] = useState(false);
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutClearRef = useRef<NodeJS.Timeout | null>(null);

    const handleInactivityAlert = () => {
        setShowModal(true);

        timeoutClearRef.current = setTimeout(() => {
            localStorage.clear();
            window.location.reload();
        }, 3000);
    };

    const resetInactivityTimer = () => {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        if (timeoutClearRef.current) clearTimeout(timeoutClearRef.current);

        inactivityTimerRef.current = setTimeout(() => {
            handleInactivityAlert();
        }, 30 * 1000);
    };

    useEffect(() => {
        resetInactivityTimer();

        const handleMouseMove = () => resetInactivityTimer();

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);

            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            if (timeoutClearRef.current) clearTimeout(timeoutClearRef.current);
        };
    }, []);

    const handleUserOK = () => {
        setShowModal(false);
        if (timeoutClearRef.current) clearTimeout(timeoutClearRef.current);
    };

    useEffect(() => {
        const emptyForm: PassengerForm = {
            isim: "",
            soyisim: "",
            telefon: "",
            eposta: "",
            cinsiyet: "Kadın",
            dogumTarihi: ""
        };
        setPassengerForms(new Array(selectedSeats.length).fill(emptyForm));
        setFormErrors(new Array(selectedSeats.length).fill({}));
    }, [selectedSeats.length]);

    const validateForm = (form: PassengerForm, index: number): { [key: string]: string } => {
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

    const handleSubmit = async () => {
        const newErrorsArray: { [key: string]: string }[] = passengerForms.map((form, index) =>
            validateForm(form, index)
        );

        setFormErrors(newErrorsArray);

        const allFormsValid = newErrorsArray.every(errors => Object.keys(errors).length === 0);

        if (allFormsValid) {
            try {
                setSeats(prevSeats =>
                    prevSeats.map(seat =>
                        selectedSeats.includes(seat.id) ? { ...seat, isFull: true } : seat
                    )
                );

                alert("İşlem Başarılı!");

                setSelectedSeats([]);
                setPassengerForms([]);
            } catch (error) {
                alert("İşlem sırasında bir hata oluştu.");
                console.error(error);
            }
        } else {
            alert("Lütfen tüm formları geçerli bilgilerle doldurun.");
        }
    };


    const handleInputChange = (index: number, field: keyof PassengerForm, value: string) => {
        const newForms = [...passengerForms];
        newForms[index] = { ...newForms[index], [field]: value };
        setPassengerForms(newForms);
    };

    useEffect(() => {
        const initializeSeats = async () => {
            const response = await axios.get("https://jsonplaceholder.typicode.com/users");
            const users = response.data;

            const initialSeats: Seat[] = Array.from({ length: 76 }, (_, index) => ({
                id: index + 1,
                isFull: index < 10,
                tooltip: index < 10 ? `${users[index].name}` : null,
            }));

            setSeats(initialSeats);
        };

        initializeSeats();
    }, []);

    useEffect(() => {
        const savedSeats = JSON.parse(localStorage.getItem("selectedSeats") || "[]");
        setSelectedSeats(savedSeats);
    }, []);

    useEffect(() => {
        localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
    }, [selectedSeats]);

    const selectSeat = (seatId: number) => {
        const seat = seats.find((s) => s.id === seatId);

        if (!seat) return;

        if (seat.isFull) {
            alert(`This seat is reserved for ${seat.tooltip}`);
            return;
        }

        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
        } else if (selectedSeats.length < maxPassengers) {
            setSelectedSeats([...selectedSeats, seatId]);
        } else {
            alert("You can select a maximum of 3 seats.");
        }
    };

    return (
        <div className="flex gap-20">
            <div className="seat-map gap-2 flex flex-col p-4">
                {seats.reduce<Seat[][]>((rows, seat, index) => {
                    if (index % 4 === 0) rows.push([]);
                    rows[rows.length - 1].push(seat);
                    return rows;
                }, []).map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2">
                        {row.map((seat) => (
                            <button
                                key={seat.id}
                                className={`${rowIndex == 3 ? 'mt-6' : ''} w-8 h-8 py-1 seat border rounded-sm ${seat.isFull ? "bg-gray-400" : "bg-gray-100"} ${selectedSeats.includes(seat.id) ? "bg-orange-400" : ""}`}
                                title={seat.isFull ? seat.tooltip || "Full" : ""}
                                onClick={() => selectSeat(seat.id)}
                            >
                                {seat.id}
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            <div className="w-96">
                <h3 className="text-lg font-semibold mb-4">Yolcu Bilgileri ({selectedSeats.length}/3)</h3>
                <div className={`space-y-2`}>
                    {selectedSeats.map((seatId, index) => (
                        <div key={seatId} className="border rounded">
                            <button
                                className="w-full p-3 text-left font-medium flex justify-between items-center cursor-pointer"
                                onClick={() => setOpenAccordion(openAccordion === index ? null : index)}
                            >
                                <span>Koltuk {seatId} - Yolcu {index + 1}</span>
                                <span>{openAccordion === index ? '↓' : '→'}</span>
                            </button>

                            <div
                                className={`overflow-y-scroll transition-all duration-500 ease-in-out`}
                                style={{
                                    maxHeight: openAccordion === index ? "500px" : "0",
                                }}
                            >
                                {openAccordion === index && (
                                    <div className="p-4 border-t">
                                        <form className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">İsim</label>
                                                <input
                                                    type="text"
                                                    value={passengerForms[index]?.isim || ''}
                                                    onChange={(e) => handleInputChange(index, "isim", e.target.value)}
                                                    className="w-full p-2 border rounded"
                                                />
                                                {formErrors[index]?.isim && (
                                                    <span className="text-red-500 text-sm">{formErrors[index].isim}</span>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Soyisim</label>
                                                <input
                                                    type="text"
                                                    value={passengerForms[index]?.soyisim || ''}
                                                    onChange={(e) => handleInputChange(index, "soyisim", e.target.value)}
                                                    className="w-full p-2 border rounded"
                                                />
                                                {formErrors[index]?.soyisim && (
                                                    <span className="text-red-500 text-sm">{formErrors[index].soyisim}</span>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Telefon (başında alan kodu olmadan)</label>
                                                <input
                                                    type="tel"
                                                    value={passengerForms[index]?.telefon || ''}
                                                    onChange={(e) => handleInputChange(index, "telefon", e.target.value)}
                                                    className="w-full p-2 border rounded"
                                                />
                                                {formErrors[index]?.telefon && (
                                                    <span className="text-red-500 text-sm">{formErrors[index].telefon}</span>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">E-posta</label>
                                                <input
                                                    type="email"
                                                    value={passengerForms[index]?.eposta || ''}
                                                    onChange={(e) => handleInputChange(index, "eposta", e.target.value)}
                                                    className="w-full p-2 border rounded"
                                                />
                                                {formErrors[index]?.eposta && (
                                                    <span className="text-red-500 text-sm">{formErrors[index].eposta}</span>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Cinsiyet</label>
                                                <select
                                                    value={passengerForms[index]?.cinsiyet || 'erkek'}
                                                    onChange={(e) => handleInputChange(index, "cinsiyet", e.target.value as "erkek" | "kadin")}
                                                    className="w-full p-2 border rounded"
                                                >
                                                    <option value="erkek">Erkek</option>
                                                    <option value="kadin">Kadın</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Doğum Tarihi</label>
                                                <input
                                                    type="date"
                                                    value={passengerForms[index]?.dogumTarihi || ''}
                                                    onChange={(e) => handleInputChange(index, "dogumTarihi", e.target.value)}
                                                    className="w-full p-2 border rounded"
                                                />
                                                {formErrors[index]?.dogumTarihi && (
                                                    <span className="text-red-500 text-sm">{formErrors[index].dogumTarihi}</span>
                                                )}
                                            </div>


                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => handleSubmit()}
                    disabled={selectedSeats?.length === 0}
                    className={`w-full my-4 py-2 rounded bg-gray-300 border text-black transition duration-400 ${selectedSeats?.length > 0 ? '' : 'hidden'}`}
                >
                    İşlemleri Tamamla
                </button>
                <div className={`bg-gray-300 h-24 flex items-center justify-between p-2 ${selectedSeats?.length > 0 ? '' : 'hidden'}`}>
                    <div className="selected-seats flex gap-2">
                        {selectedSeats?.map((item, index) => (
                            <div key={index} className="w-4 h-6 text-xs bg-orange-400 rounded-sm">{item}</div>
                        ))}
                    </div>
                    <div className="prices flex flex-col">
                        <div className="flex gap-2">{selectedSeats?.length}x<div className="w-4 h-6 text-xs bg-orange-400 rounded-sm">{""}</div></div>
                        <div>{selectedSeats?.length * 1000} TL</div>
                    </div>
                </div>
            </div>
            {showModal && (
                <div className="modal mt-20 border border-gray-200 shadow-md h-24 p-2">
                    <div className="modal-content">
                        <p>30 saniyedir işlem yapmadınız, İşleme devam etmek istiyor musunuz?</p>
                        <button className="mt-4 border rounded px-4 py-2" onClick={handleUserOK}>Devam Et</button>
                    </div>
                </div>
            )}
        </div>
    );

};

export default SeatMap;
