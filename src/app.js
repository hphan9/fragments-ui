// src/app.js

import { Auth, getUser } from "./auth";
import { getUserFragments } from "./api";
import { createFragment } from "./api";
async function init() {
  // Get our UI elements
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");
  const fragmentForm = document.querySelector("#fragmentForm");
  const formSection = document.querySelector("#form");
  const inputData = document.querySelector("#fragmentData");
  const formsubmitBtn = document.querySelector("#formButton");
  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }
  // Do an authenticated request to the fragments API server and log the result
  getUserFragments(user);

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector(".username").innerText = user.username;

  formSection.hidden = false;
  // Disable the Login button
  loginBtn.disabled = true;
  fragmentForm.onsubmit = (event) => {
    event.preventDefault();
    console.log("Form Submit");
    console.log(event.target.fdata.value);
    const data = event.target.fdata.value;
    createFragment(user, data);
  };
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
