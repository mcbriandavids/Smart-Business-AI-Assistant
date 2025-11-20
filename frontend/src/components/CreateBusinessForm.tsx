import React, { useEffect, useState } from "react";
import { api } from "../api/client";

// cSpell:disable LGA Topbar

interface CreateBusinessFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateBusinessForm({
  onSuccess,
  onCancel,
}: CreateBusinessFormProps) {
  // Autofill lat/lng from browser geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(6));
          setLng(pos.coords.longitude.toFixed(6));
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [lga, setLga] = useState<string>("");
  const [zipCode, setZipCode] = useState<string>("");
  const [country, setCountry] = useState<string>("Nigeria");
  // Nigeria states and LGAs
  // cSpell:disable
  const nigeriaStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];
  const nigeriaLgas: Record<string, string[]> = {
    Lagos: [
      "Agege",
      "Ajeromi-Ifelodun",
      "Alimosho",
      "Amuwo-Odofin",
      "Apapa",
      "Badagry",
      "Epe",
      "Eti-Osa",
      "Ibeju-Lekki",
      "Ifako-Ijaiye",
      "Ikeja",
      "Ikorodu",
      "Kosofe",
      "Lagos Island",
      "Lagos Mainland",
      "Mushin",
      "Ojo",
      "Oshodi-Isolo",
      "Shomolu",
      "Surulere",
    ],
    // Add more states and their LGAs as needed
  };
  // cSpell:enable
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [facebook, setFacebook] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [instagram, setInstagram] = useState<string>("");
  const [linkedin, setLinkedin] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  // Categories from backend enum
  const categories = [
    "restaurant",
    "grocery",
    "pharmacy",
    "electronics",
    "clothing",
    "beauty",
    "home_garden",
    "sports",
    "books",
    "toys",
    "automotive",
    "health",
    "services",
    "other",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/businesses", {
        name,
        description,
        category,
        address: {
          street,
          city,
          state,
          zipCode,
          country,
          coordinates: {
            lat: Number(lat),
            lng: Number(lng),
          },
        },
        contact: {
          email,
          phone,
          website,
          socialMedia: {
            facebook,
            twitter,
            instagram,
            linkedin,
          },
        },
      });
      onSuccess();
    } catch (err: any) {
      if (err?.response?.data?.message) {
        window.dispatchEvent(
          new CustomEvent("dashboard-error", {
            detail: err.response.data.message,
          })
        );
      }
      alert(err?.response?.data?.message || "Failed to create business");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="stack stack--tight" onSubmit={handleSubmit}>
      <div className="form-field">
        <label className="form-label" htmlFor="business-name">
          Business name
        </label>
        <input
          id="business-name"
          className="form-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          placeholder="Acme Foods"
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="business-description">
          Description
        </label>
        <textarea
          id="business-description"
          className="form-input form-textarea"
          minLength={20}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          placeholder="Introduce the products and services you offer."
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="business-category">
          Category
        </label>
        <select
          id="business-category"
          className="form-input"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          required
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="form-grid form-grid--two">
        <div className="form-field">
          <label className="form-label" htmlFor="business-email">
            Email
          </label>
          <input
            id="business-email"
            type="email"
            className="form-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="hello@business.com"
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="business-phone">
            Phone
          </label>
          <input
            id="business-phone"
            className="form-input"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
            placeholder="(555) 555-5555"
          />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="business-website">
          Website
        </label>
        <input
          id="business-website"
          className="form-input"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          placeholder="https://"
        />
      </div>

      <div className="form-grid form-grid--two">
        <div className="form-field">
          <label className="form-label" htmlFor="address-street">
            Street address
          </label>
          <input
            id="address-street"
            className="form-input"
            value={street}
            onChange={(event) => setStreet(event.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="address-city">
            City
          </label>
          <input
            id="address-city"
            className="form-input"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-grid form-grid--two">
        <div className="form-field">
          <label className="form-label" htmlFor="address-state">
            State
          </label>
          <select
            id="address-state"
            className="form-input"
            value={state || ""}
            onChange={(event) => {
              setState(event.target.value);
              setLga("");
            }}
            required
          >
            <option value="">Select state</option>
            {nigeriaStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="address-lga">
            Local Government Area
          </label>
          <select
            id="address-lga"
            className="form-input"
            value={lga}
            onChange={(event) => setLga(event.target.value)}
            required={Boolean(state && nigeriaLgas[state])}
            disabled={!state || !nigeriaLgas[state]}
          >
            <option value="">Select LGA</option>
            {state && nigeriaLgas[state]
              ? nigeriaLgas[state].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))
              : null}
          </select>
        </div>
      </div>

      <div className="form-grid form-grid--two">
        <div className="form-field">
          <label className="form-label" htmlFor="address-zip">
            Zip code
          </label>
          <input
            id="address-zip"
            className="form-input"
            value={zipCode}
            onChange={(event) => setZipCode(event.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="address-country">
            Country
          </label>
          <select
            id="address-country"
            className="form-input"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            required
            disabled
          >
            <option value="Nigeria">Nigeria</option>
          </select>
        </div>
      </div>

      <div className="form-grid form-grid--two">
        <div className="form-field">
          <label className="form-label" htmlFor="geo-lat">
            Latitude
          </label>
          <input
            id="geo-lat"
            type="number"
            className="form-input"
            value={lat}
            onChange={(event) => setLat(event.target.value)}
            required
            step="0.000001"
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="geo-lng">
            Longitude
          </label>
          <input
            id="geo-lng"
            type="number"
            className="form-input"
            value={lng}
            onChange={(event) => setLng(event.target.value)}
            required
            step="0.000001"
          />
        </div>
      </div>

      <div className="form-grid form-grid--two">
        <div className="form-field">
          <label className="form-label" htmlFor="social-facebook">
            Facebook
          </label>
          <input
            id="social-facebook"
            className="form-input"
            value={facebook}
            onChange={(event) => setFacebook(event.target.value)}
            placeholder="https://facebook.com/"
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="social-twitter">
            Twitter
          </label>
          <input
            id="social-twitter"
            className="form-input"
            value={twitter}
            onChange={(event) => setTwitter(event.target.value)}
            placeholder="https://x.com/"
          />
        </div>
      </div>

      <div className="form-grid form-grid--two">
        <div className="form-field">
          <label className="form-label" htmlFor="social-instagram">
            Instagram
          </label>
          <input
            id="social-instagram"
            className="form-input"
            value={instagram}
            onChange={(event) => setInstagram(event.target.value)}
            placeholder="https://instagram.com/"
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="social-linkedin">
            LinkedIn
          </label>
          <input
            id="social-linkedin"
            className="form-input"
            value={linkedin}
            onChange={(event) => setLinkedin(event.target.value)}
            placeholder="https://linkedin.com/company/"
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="vendor-button vendor-button--ghost"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="vendor-button vendor-button--primary"
          disabled={saving}
        >
          {saving ? "Creating…" : "Create business"}
        </button>
      </div>
    </form>
  );
}
