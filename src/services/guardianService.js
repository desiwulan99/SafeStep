const STORAGE_KEY_CONTACTS = "safestep_guardian_contacts";
const STORAGE_KEY_SESSION = "safestep_guardian_session";
const STORAGE_KEY_MESSAGES = "safestep_guardian_messages";

const DEFAULT_CONTACTS = [
  { id: "ibu", name: "Ibu", phone: "08123456789", relation: "Keluarga", isOnline: true, hasWings: true },
  { id: "kak-inul", name: "Kak Inul", phone: "08987654321", relation: "Kerabat", isOnline: false },
  { id: "anita", name: "Anita", phone: "08555123456", relation: "Teman", isOnline: true }
];

const DEFAULT_SESSION = {
  isActive: false,
  activeContactName: "Ibu",
  startTime: null
};

const DEFAULT_MESSAGES = {
  Ibu: [
    { id: 1, sender: "user", text: "Memilih Ibu menjadi Live Guardian", time: "14:20", type: "invite" },
    { id: 2, sender: "Ibu", text: "Ibu menjadi Live Guardian", time: "14:20", type: "accepted" },
    { id: 3, sender: "Ibu", text: "Oke, nanti Ibu jemput di situ ya.", time: "14:22" }
  ],
  Anita: [
    { id: 1, sender: "Anita", text: "anita06 memilih Anda menjadi Live Guardian", time: "14:20", type: "invite_received" }
  ],
  "Kak Inul": [
    { id: 1, sender: "Kak Inul", text: "Live Tracking Sent.", time: "14:15" }
  ]
};

function getCurrentTimeStr() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function getGuardianContacts() {
  const data = localStorage.getItem(STORAGE_KEY_CONTACTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(DEFAULT_CONTACTS));
    return DEFAULT_CONTACTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_CONTACTS;
  }
}

export function addGuardianContact(contact) {
  const contacts = getGuardianContacts();
  const newContact = {
    id: `contact-${Date.now()}`,
    name: contact.name,
    phone: contact.phone || "",
    relation: contact.relation || "Teman",
    isOnline: true
  };
  const updated = [...contacts, newContact];
  localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(updated));
  window.dispatchEvent(new Event("guardian_update"));
  return newContact;
}

export function getGuardianSession() {
  const data = localStorage.getItem(STORAGE_KEY_SESSION);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(DEFAULT_SESSION));
    return DEFAULT_SESSION;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_SESSION;
  }
}

export function setGuardianSession(activeContactName, isActive) {
  const session = {
    isActive,
    activeContactName: activeContactName || "Ibu",
    startTime: isActive ? Date.now() : null
  };
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));

  if (isActive && activeContactName) {
    sendGuardianMessage(activeContactName, {
      sender: "user",
      text: `Memilih ${activeContactName} menjadi Live Guardian`,
      type: "invite"
    });
  }

  window.dispatchEvent(new Event("guardian_update"));
  return session;
}

export function getGuardianMessages() {
  const data = localStorage.getItem(STORAGE_KEY_MESSAGES);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(DEFAULT_MESSAGES));
    return DEFAULT_MESSAGES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_MESSAGES;
  }
}

export function sendGuardianMessage(contactName, msgObj) {
  const allMessages = getGuardianMessages();
  const contactMsgs = allMessages[contactName] || [];

  const newMsg = {
    id: Date.now(),
    sender: msgObj.sender || "user",
    text: msgObj.text,
    time: msgObj.time || getCurrentTimeStr(),
    type: msgObj.type || "text",
    metadata: msgObj.metadata || null
  };

  const updated = {
    ...allMessages,
    [contactName]: [...contactMsgs, newMsg]
  };

  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updated));
  window.dispatchEvent(new Event("guardian_update"));
  return newMsg;
}

export function sendRouteToGuardian({ startPoint, endPoint, distanceText, durationText, riskLevel, riskScore }) {
  const session = getGuardianSession();
  const contactName = session.activeContactName || "Ibu";

  const text = `Berbagi Rute Aman:\n• Titik Awal: ${startPoint || "Lokasi Dipilih"}\n• Tujuan: ${endPoint || "Tujuan Dipilih"}\n• Jarak/Waktu: ${distanceText || ""} ${durationText ? `(${durationText})` : ""}\n• Status Risiko: ${riskLevel || "Aman"} (${riskScore ? Math.round(riskScore) : 30}/100)`;

  sendGuardianMessage(contactName, {
    sender: "user",
    text,
    type: "route_share",
    metadata: { startPoint, endPoint, distanceText, durationText, riskLevel, riskScore }
  });

  return { contactName, text };
}

export function sendSosToGuardian({ position, address }) {
  const contacts = getGuardianContacts();
  const session = getGuardianSession();

  const latLngStr = position ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : "Lokasi Aktif";
  const locStr = address || latLngStr;

  const text = `SOS DARURAT! Saya membutuhkan pertolongan segera di lokasi real-time: ${locStr}. Peta: https://maps.google.com/?q=${position?.lat || -6.2088},${position?.lng || 106.8456}`;

  contacts.forEach(c => {
    sendGuardianMessage(c.name, {
      sender: "user",
      text,
      type: "sos_alert",
      metadata: { position, address }
    });
  });

  return { activeContact: session.activeContactName || "Ibu", text };
}
