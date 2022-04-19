// src/api.js

//import { get } from "express/lib/response";

// fragments microservice API
const apiUrl = process.env.API_URL;

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */

export async function getUserFragments(user) {
  console.log("Requesting user fragments meta data...");
  try {
    const res = await fetch(`${apiUrl}/v1/fragments?expand=1`, {
      method: "GET",
      headers: {
        // Include the user's ID Token in the request so we're authorized
        Authorization: `Bearer ${user.idToken}`,
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log("Got user fragments meta data", { data });
    return data;
  } catch (err) {
    console.error("Unable to call GET /v1/fragment", { err });
  }
}

export async function getFragment(user, id) {
  console.log("Requesting fragment data...", { id });
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: "GET",
      headers: {
        // Include the user's ID Token in the request so we're authorized
        Authorization: `Bearer ${user.idToken}`,
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    //return blob
    return await res.blob();
  } catch (err) {
    console.error("Unable to call GET /v1/fragment/:id", { err });
  }
}
export async function createFragment(user, fragmentData, contentType) {
  console.log("Start creating fragment");
  console.log("data", fragmentData);
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: "POST",
      headers: {
        // Include the user's ID Token in the request so we're authorized
        Authorization: `Bearer ${user.idToken}`,
        "Content-Type": contentType,
      },
      body: fragmentData,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const responseData = await res.json();
    console.log("new fragment data created", { responseData });
  } catch (err) {
    console.error("Unable to call POST /v1/fragment", { err });
  }
}

export async function updateFragment(user, id, fragmentData, contentType) {
  console.log("Start updating fragment");
  console.log("data", fragmentData);
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: "PUT",
      headers: {
        // Include the user's ID Token in the request so we're authorized
        Authorization: `Bearer ${user.idToken}`,
        "Content-Type": contentType,
      },
      body: fragmentData,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const responseData = await res.json();
    console.log("fragment data updated", { responseData });
  } catch (err) {
    console.error("Unable to call PUT /v1/fragment", { err });
  }
}
export async function deleteFragment(user, id) {
  console.log("Requesting fragment data...", { id });
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: "DELETE",
      headers: {
        // Include the user's ID Token in the request so we're authorized
        Authorization: `Bearer ${user.idToken}`,
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log("Got fragment data", { data });
    return data;
  } catch (err) {
    console.error("Unable to call GET /v1/fragment", { err });
  }
}
