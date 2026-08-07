import { useState, useEffect } from "react";
import { User, X, Plus, Phone, ShieldCheck } from "lucide-react";
import {
  getGuardianContacts,
  addGuardianContact,
  setGuardianSession,
} from "../../services/guardianService";
import "./SelectGuardianModal.css";

export default function SelectGuardianModal({
  isOpen,
  onClose,
  title = "Pilih Kontak Live Guardian",
  description = "Anda belum mengaktifkan Live Guardian. Pilih kontak darurat yang ingin dikirimi lokasi / rute perjalanan:",
  onSelect,
}) {
  const [contacts, setContacts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("Keluarga");

  useEffect(() => {
    if (isOpen) {
      setContacts(getGuardianContacts());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (contactName) => {
    setGuardianSession(contactName, true);
    if (onSelect) onSelect(contactName);
    onClose();
  };

  const handleCreateContact = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newC = addGuardianContact({
      name: name.trim(),
      phone: phone.trim(),
      relation,
    });
    setContacts(getGuardianContacts());
    setName("");
    setPhone("");
    setShowAddForm(false);
    handleSelect(newC.name);
  };

  return (
    <div className="select-guardian-modal__overlay" onClick={onClose}>
      <div
        className="select-guardian-modal__card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="select-guardian-modal__header">
          <div className="select-guardian-modal__title-row">
            <ShieldCheck size={22} color="#a81b58" />
            <h3>{title}</h3>
          </div>
          <button
            type="button"
            className="select-guardian-modal__close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <p className="select-guardian-modal__desc">{description}</p>

        <div className="select-guardian-modal__list">
          {contacts.map((c) => (
            <div key={c.id} className="select-guardian-modal__item">
              <div className="select-guardian-modal__avatar">
                <User size={20} />
              </div>
              <div className="select-guardian-modal__info">
                <div className="select-guardian-modal__name-row">
                  <span className="select-guardian-modal__name">{c.name}</span>
                  {c.relation && (
                    <span className="select-guardian-modal__badge">
                      {c.relation}
                    </span>
                  )}
                </div>
                <span className="select-guardian-modal__phone">
                  {c.phone || "Kontak Tersimpan"}
                </span>
              </div>
              <div className="select-guardian-modal__actions">
                {c.phone && (
                  <a
                    href={`https://wa.me/${c.phone.replace(/^0/, "62")}?text=${encodeURIComponent(
                      `Halo ${c.name}, saya membagikan rute perjalanan SafeStep dengan Anda.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="select-guardian-modal__wa-btn"
                    title="Kirim pesan via WhatsApp"
                  >
                    <Phone size={13} />
                    <span>WA</span>
                  </a>
                )}
                <button
                  type="button"
                  className="select-guardian-modal__select-btn"
                  onClick={() => handleSelect(c.name)}
                >
                  Pilih & Kirim
                </button>
              </div>
            </div>
          ))}
        </div>

        {!showAddForm ? (
          <button
            type="button"
            className="select-guardian-modal__add-btn"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} />
            <span>Tambah Kontak Baru</span>
          </button>
        ) : (
          <form
            onSubmit={handleCreateContact}
            className="select-guardian-modal__form"
          >
            <h4>Tambah Kontak Baru</h4>
            <input
              type="text"
              placeholder="Nama Kontak (misal: Ayah, Teman)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="select-guardian-modal__input"
              required
            />
            <input
              type="tel"
              placeholder="Nomor HP / WhatsApp (misal: 08123456789)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="select-guardian-modal__input"
            />
            <div className="select-guardian-modal__btn-row">
              <button
                type="submit"
                className="select-guardian-modal__select-btn"
              >
                Simpan & Gunakan
              </button>
              <button
                type="button"
                className="select-guardian-modal__cancel-btn"
                onClick={() => setShowAddForm(false)}
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
