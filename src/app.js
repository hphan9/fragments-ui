// src/app.js

import { Auth, getUser } from "./auth";
import { createFragment, getUserFragments} from "./api";
import { ConsoleLogger } from "@aws-amplify/core";

function createFragmentList( fragments) {
  var list = document.createElement("ol");
  fragments.forEach(async (d) => {
    let li = document.createElement("li");
    li.innerHTML = `Id: ${d.id}  <br/>  Created: ${new Date(d.created).toDateString()} <br/> Type: ${d.type} `;
    list.append(li);
  });
  return list;
}

async function displayUserFragmentList(user, listFragment){
  let responseGetUserFragments = await getUserFragments(user);
  var listFragmentDiv= listFragment.querySelector("div");
  listFragmentDiv.innerHTML="";
  if (responseGetUserFragments.status == "ok") {
    const fragments = responseGetUserFragments.fragments;
    if (fragments.length > 0) {
      const ul = createFragmentList(fragments);
      listFragmentDiv.append(ul);
    }
  } else {
    listFragmentDiv.innerHTML = "<p>Error loading Fragments data for user</p>";
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
  fragmentForm.onsubmit = async (event) => {
    event.preventDefault();
    console.log("Form Submit");
    let contentType = event.target.fragmentType.value;
    let data = event.target.fragmentFile.files[0];
    console.log(contentType);
    console.log(data);
    await createFragment(user, data, contentType);
    fragmentForm.reset();
    await displayUserFragmentList(user, listFragment);
  };
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
