// src/app.js

import { Auth, getUser } from "./auth";
import {
  createFragment,
  getUserFragments,
  getFragment,
  deleteFragment,
  updateFragment,
} from "./api";
import { ConsoleLogger } from "@aws-amplify/core";

async function showData(user, id) {
  const data = await getFragment(user, id);
  return data;
}
async function createFragmentList(user, tbodyFragments, fragments) {
  let count = 1;
  fragments.forEach(async (d) => {
    let row = document.createElement("tr");
    let number = document.createElement("th");
    number.innerHTML = count++;
    number.scope = "row";
    let colID = document.createElement("td");
    let colData = document.createElement("td");
    let colUpdate = document.createElement("td");
    let colDelete = document.createElement("td");
    colID.innerHTML = d.id;
    colData.innerHTML = await showData(user, d.id);
    let updateButton = document.createElement("button");
    updateButton.innerHTML = "Update";
    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.onclick = async () => {
      await deleteFragment(user, d.id);
      alert("Delete Fragment");
      window.location.reload();
    };
    colUpdate.append(updateButton);
    colDelete.append(deleteButton);
    row.append(number, colID, colData, colUpdate, colDelete);
    tbodyFragments.append(row);
  });
}

async function displayUserFragmentList(user, listFragment) {
  let responseGetUserFragments = await getUserFragments(user);
  var listFragmentTable = listFragment.querySelector("tbody");
  listFragmentTable.innerHTML = "";
  if (responseGetUserFragments.status == "ok") {
    const fragments = responseGetUserFragments.fragments;
    if (fragments.length > 0) {
      await createFragmentList(user, listFragmentTable, fragments);
    }
  } else {
    listFragmentTable.innerHTML =
      "<p>Error loading Fragments data for user</p>";
  }
}

async function init() {
  // Get our UI elements
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");
  const fragmentForm = document.querySelector("#fragmentForm");
  const formSection = document.querySelector("#form");
  const listFragment = document.querySelector("#listFragment");
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

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;
  listFragment.hidden = false;
  formSection.hidden = false;
  // Show the user's username
  userSection.querySelector(".username").innerText = user.username;

  //Show the user's fragment
  await displayUserFragmentList(user, listFragment);

  // Disable the Login button
  loginBtn.disabled = true;

  //submit form
  fragmentForm.onsubmit = async (event) => {
    event.preventDefault();
    console.log("Form Submit");
    let contentType = event.target.fragmentType.value;
    let data = event.target.fragmentFile.files[0];
    console.log(contentType);
    console.log(data);
    await createFragment(user, data, contentType);
    fragmentForm.reset();
    window.location.reload();
  };
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
