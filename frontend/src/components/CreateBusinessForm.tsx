import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  DialogActions,
} from "@mui/material";
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
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
    >
      <TextField
        label="Business Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        fullWidth
        multiline
        minRows={2}
      />
      <TextField
        select
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
        fullWidth
        slotProps={{ select: { native: true } }}
      >
        <option value="">Select category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat.replace(/_/g, " ")}
          </option>
        ))}
      </TextField>
      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        type="email"
      />
      <TextField
        label="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        fullWidth
      />
      <TextField
        label="Street Address"
        value={street}
        onChange={(e) => setStreet(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        required
        fullWidth
      />
      <TextField
        select
        label="State"
        value={state || ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setState(e.target.value);
          setLga("");
        }}
        required
        fullWidth
        slotProps={{ select: { native: true } }}
      >
        <option value="">Select state</option>
        {nigeriaStates.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </TextField>

      {state && nigeriaLgas[state] && (
        <TextField
          select
          label="Local Government Area (LGA)"
          value={lga}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLga(e.target.value)
          }
          required
          fullWidth
          slotProps={{ select: { native: true } }}
        >
          <option value="">Select LGA</option>
          {nigeriaLgas[state].map((l: string) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </TextField>
      )}

      <TextField
        label="Zip Code"
        value={zipCode}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setZipCode(e.target.value)
        }
        required
        fullWidth
      />
      <TextField
        select
        label="Country"
        value={country}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setCountry(e.target.value)
        }
        required
        fullWidth
        disabled
        slotProps={{ select: { native: true } }}
      >
        <option value="Nigeria">Nigeria</option>
      </TextField>

      <TextField
        label="Latitude"
        value={lat}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setLat(e.target.value)
        }
        required
        fullWidth
        type="number"
      />
      <TextField
        label="Longitude"
        value={lng}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setLng(e.target.value)
        }
        required
        fullWidth
        type="number"
      />
      <TextField
        label="Facebook"
        value={facebook}
        onChange={(e) => setFacebook(e.target.value)}
        fullWidth
      />
      <TextField
        label="Twitter"
        value={twitter}
        onChange={(e) => setTwitter(e.target.value)}
        fullWidth
      />
      <TextField
        label="Instagram"
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
        fullWidth
      />
      <TextField
        label="LinkedIn"
        value={linkedin}
        onChange={(e) => setLinkedin(e.target.value)}
        fullWidth
      />
      <DialogActions>
        <Button onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={saving}
        >
          {saving ? "Creating..." : "Create Business"}
        </Button>
      </DialogActions>
    </Box>
  );
}