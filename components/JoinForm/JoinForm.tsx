"use client";

import { useFormState } from "react-dom";
import { useFormStatus } from "react-dom";
import { JoinFormInput, submitJoinForm } from "@/app/api";
import { useRouter } from 'next/navigation';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { E164Number } from 'libphonenumber-js/core';
import { ErrorBoundary } from "react-error-boundary";
import { toastErrorMessage } from "@/app/utils/toastErrorMessage";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import styles from './JoinForm.module.scss'

// import { SubmitHandler, useForm } from 'react-hook-form'
import Select from 'react-select'
import { FormEvent, useState } from "react";

import Button from "@mui/material/Button";

const options = [
  { value: 'NY', label: 'New York' },
  { value: 'NJ', label: 'New Jersey' },
]

// FIXME: I have no idea how this works. I think this is some
// handleSubmit meme
 interface Fields {
   first_name: string
   last_name: string
   email: string
   phone: string
   street_address: string
   apartment: string
   city: string
   state: string
   roof_access: boolean
   referral: string
 }

const JoinForm = () => {
  function parseForm(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget)
    const data: Record<string, string | Blob | boolean | Number > = {};
    formData.forEach((value, key) => {
      if (key === 'roof_access' || key === 'ncl') {
        // Special case for the checkbox
        // This won't work for unchecked boxes because JS good language
        data[key] = value === 'on' ? true : false;
      } else if (key === 'zip') {
        data[key] = Number(value);
      } else {
        data[key] = value;
      }
    });

    // Special cases for the checkboxes
    // Bail if no NCL
    if (data['ncl'] !== true) {
      data['ncl'] = false

      toast.error('You must accept the Network Commons License!', {
        hideProgressBar: true,
        theme: "colored",
      });
      return;
    }

    // Set roof_access to false if necessary
    if (data['roof_access'] !== true) {
      data['roof_access'] = false;
    }

    return JoinFormInput.parse(data);
  }

  // TODO: Redirect them to a thank you/next steps page or something after they have submitted.
  async function sendForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(event); 

    try {
      setIsLoading(true);
      let parsedForm = parseForm(event);
      if (parsedForm === undefined) return;
      let j: JoinFormInput = parsedForm;
      console.log(j);
      await submitJoinForm(j);
      toast.success('Thanks! You will receive an email shortly :)', {
        hideProgressBar: true,
        theme: "colored",
      });
    } catch (e) {
      console.log("Could not submit Join Form:");
      toastErrorMessage(e);
      setIsLoading(false);
      return
    }
    setSubmitted(true);
    setIsLoading(false);
  }

  const [phoneNumber, setPhoneNumber] = useState<E164Number | undefined>()
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return <>
    <div className={styles.formBody}>
      <form onSubmit={sendForm}>
        <h2>Join NYC Mesh</h2>
        <p>Join our community network! Fill out the form, and we will reach out over email shortly.</p>
        <div>
        <h3>Personal Info</h3>
          <input type="text" name="first_name" placeholder="First Name" required />
          <input type="text" name="last_name" placeholder="Last Name" required />

          <input type="email" name="email" placeholder="Email Address" required />

          <PhoneInput
            name="phone"
            placeholder="Phone Number"
            defaultCountry="US"
            international={true}
            value={phoneNumber}
            onChange={setPhoneNumber}/>
        </div>

        <div className={styles.block}>
          <h3>Address Info</h3>
          <input type="text" name="street_address" placeholder="Street Address" required />
          <input type="text" name="apartment" placeholder="Unit #" required />
          <input type="text" name="city" placeholder="City" required />
          <Select name="state" placeholder="State" options={options} className={styles.drop} />
          <input type="number" name="zip" placeholder="Zip Code" required />
          <label>
            <input type="checkbox" name="roof_access"/>
            Check this box if you have roof access
          </label>
        </div>
        <br/>
        <input type="text" name="referral" placeholder="How did you hear about us?" />
        <label>
            <input type="checkbox" name="ncl" required/>
            I agree to the <a href="https://www.nycmesh.net/ncl.pdf" target="_blank" style={{color:"black"}}>Network Commons License</a>
          </label>
        <div className={styles.centered}>
          <Button
            type="submit"
            disabled={isLoading || submitted}
            variant="contained"
            size="large"
            sx={{ width: "12rem", fontSize: "1rem", m:"1rem"}}
          >
            { isLoading ? "Loading..." : (submitted ? "Thanks!" : "Submit") }
          </Button>
        </div>
      </form>
    </div>
    <ToastContainer />
  </>
}

export default JoinForm
