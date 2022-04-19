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
  let data;
  var paragraph = document.createElement("p");
  data = await getFragment(user, id);
  if (data == undefined) {
    let error = "Error requesting fragment data with requested extension";
    paragraph.innerHTML = error;
    return paragraph;
  } else {
    const type = data.type;
    console.log(type);
    if (
      /text\/plain/.test(type) ||
      /text\/markdown/.test(type) ||
      /\*\/json*/.test(type)
    ) {
      let textData = await data.text();
      paragraph.innerHTML = textData;
      return paragraph;
    } else if (/text\/html/.test(type)) {
      const textData = await data.text();
      const div = document.createElement("div");
      div.innerHTML = textData;
      return div;
    } else if (/image\/*/.test(type)) {
      let image = document.createElement("img");
      const src = URL.createObjectURL(data);
      image.src = src;
      console.log(image.src);
      return image;
    }
  }
}
async function createFragmentList(user, tbodyFragments, fragments) {
  let count = 1;
  fragments.forEach(async (d) => {
    let row = document.createElement("tr");
    let number = document.createElement("th");
    number.innerHTML = count++;
    number.scope = "row";
    let colID = document.createElement("td");
    let colUpdate = document.createElement("td");
    let colDelete = document.createElement("td");
    let colType = document.createElement("td");
    let colSize = document.createElement("td");
    colID.innerHTML = d.id;
    colType.innerHTML = d.type;
    colUpdate.innerHTML = d.updated;
    colSize.innerHTML = d.size;
    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.onclick = async () => {
      await deleteFragment(user, d.id);
      alert("Delete Fragment");
      window.location.reload();
    };
    colDelete.append(deleteButton);
    row.append(number, colID, colUpdate, colType, colSize, colDelete);
    tbodyFragments.append(row);
  });
}

function createOptionList(fragmentIdsSelect, fragments) {
  fragmentIdsSelect.innerHTML = "";
  fragments.forEach((d) => {
    const option = document.createElement("option");
    option.value = d.id;
    option.innerHTML = d.id;
    option.setAttribute("data-type", d.type);
    fragmentIdsSelect.append(option);
  });
}
async function displayUserFragmentList(
  user,
  listFragment,
  fragmentIdsSelectUpdate,
  fragmentIdsSelectView
) {
  let responseGetUserFragments = await getUserFragments(user);
  var listFragmentTable = listFragment.querySelector("tbody");
  listFragmentTable.innerHTML = "";
  if (responseGetUserFragments.status == "ok") {
    const fragments = responseGetUserFragments.fragments;
    if (fragments.length > 0) {
      await createFragmentList(user, listFragmentTable, fragments);
      createOptionList(fragmentIdsSelectUpdate, fragments);
      createOptionList(fragmentIdsSelectView, fragments);
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
  const formSection = document.querySelector("#createForm");
  const listFragment = document.querySelector("#listFragment");
  const updateFormSection = document.querySelector("#updateFormSection");
  const updateForm = document.querySelector("#updateForm");
  const viewFormSection = document.querySelector("#viewFormSection");
  const viewForm = document.querySelector("#viewForm");
  const fragmentIdsSelectUpdate = updateForm.querySelector("#fragmentId");
  const fragmentIdsSelectView = viewForm.querySelector("#fragmentId");
  const fragmentData = document.querySelector("#fragmentData");
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
  updateFormSection.hidden = false;
  viewFormSection.hidden = false;
  // Disable the Login button
  loginBtn.disabled = true;
  // Show the user's username
  userSection.querySelector(".username").innerText = user.username;

  //Show the user's fragment
  await displayUserFragmentList(
    user,
    listFragment,
    fragmentIdsSelectUpdate,
    fragmentIdsSelectView
  );
  //submit form
  viewForm.onsubmit = async (event) => {
    event.preventDefault();
    fragmentData.innerHTML = "";
    console.log("View Form Submit");
    let id = event.target.fragmentId.value;
    const ext = event.target.extension.value;
    id = id + ext;
    console.log(id);
    const data = await getFragment(user, id, ext);
    console.log(data);
    const element = await showData(user, id);
    fragmentData.append(element);
    fragmentData.hidden = false;
    viewForm.reset();
  };
  updateForm.onsubmit = async (event) => {
    event.preventDefault();
    console.log("Update Form Submit");
    const selected = event.target.fragmentId;
    const optionSelected = selected.options[selected.selectedIndex];
    const id = optionSelected.value;
    const contentType = optionSelected.getAttribute("data-type");
    console.log(contentType);
    const data = event.target.fragmentFile.files[0];
    console.log(data);
    await updateFragment(user, id, data, contentType);
    updateForm.reset();
    await displayUserFragmentList(
      user,
      listFragment,
      fragmentIdsSelectUpdate,
      fragmentIdsSelectView
    );
  };
  //submit form
  fragmentForm.onsubmit = async (event) => {
    event.preventDefault();
    console.log("Form Submit");
    const contentType = event.target.fragmentType.value;
    const data = event.target.fragmentFile.files[0];
    console.log(contentType);
    console.log(data);
    await createFragment(user, data, contentType);
    fragmentForm.reset();
    await displayUserFragmentList(
      user,
      listFragment,
      fragmentIdsSelectUpdate,
      fragmentIdsSelectView
    );
  };
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
