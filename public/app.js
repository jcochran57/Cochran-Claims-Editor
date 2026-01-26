
/***********************
 * Firebase Config
 ***********************/
const firebaseConfig = {
  apiKey: "AIzaSyB5v7ICjvpK1z7pMvvBhZWSYjGp_ac_A9U",
  authDomain: "cochran-claims.firebaseapp.com",
  projectId: "cochran-claims"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

/***********************
 * DOM
 ***********************/
const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");
const newClaimBtn = document.getElementById("newClaimBtn");
const saveBtn = document.getElementById("saveBtn");
const claimSelect = document.getElementById("claimSelect");

/***********************
 * State
 ***********************/
let currentUser = null;
let currentClaimId = null;

/***********************
 * Auth
 ***********************/
signInBtn.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
};

signOutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
  currentUser = user;

  if (!user) {
    signInBtn.disabled = false;
    signOutBtn.disabled = true;
    newClaimBtn.disabled = true;
    saveBtn.disabled = true;
    claimSelect.disabled = true;
    return;
  }

  signInBtn.disabled = true;
  signOutBtn.disabled = false;
  newClaimBtn.disabled = false;
  saveBtn.disabled = false;
  claimSelect.disabled = false;

  loadClaims();
});

/***********************
 * Load Claims
 ***********************/
async function loadClaims() {
  claimSelect.innerHTML = `<option value="">Select Claim…</option>`;

  const snap = await db.collection("claims")
    .where("userId", "==", currentUser.uid)
    .get();

  snap.forEach(doc => {
    const opt = document.createElement("option");
    opt.value = doc.id;
    opt.textContent = doc.data().lastName || doc.id;
    claimSelect.appendChild(opt);
  });
}

claimSelect.onchange = async () => {
  if (!claimSelect.value) return;

  currentClaimId = claimSelect.value;
  const doc = await db.collection("claims").doc(currentClaimId).get();
  fillForm(doc.data());
};

/***********************
 * New Claim
 ***********************/
newClaimBtn.onclick = () => {
  currentClaimId = null;
  document.querySelectorAll("input, textarea").forEach(el => el.value = "");
};

/***********************
 * Save Claim
 ***********************/
saveBtn.onclick = async () => {
  if (!currentUser) return;

  const data = {
    userId: currentUser.uid,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),

    firstName: firstName.value,
    middleInitial: middleInitial.value,
    lastName: lastName.value,
    phone: phone.value,
    email: email.value,

    property: {
      addr1: propAddr1.value,
      addr2: propAddr2.value,
      city: propCity.value,
      state: propState.value,
      zip: propZip.value
    },

    claim: {
      reason: reason.value,
      estimatedLoss: estimatedLoss.value,
      dateOfLoss: dateOfLoss.value,
      causeOfLoss: causeOfLoss.value,
      description: description.value
    },

    insurance: {
      company: insuranceCompany.value,
      policy: policyNumber.value,
      claimNumber: insuranceClaimNumber.value
    },

    mortgage: {
      company: mortgageCompany.value,
      loan: loanNumber.value
    },

    notes: notes.value
  };

  if (currentClaimId) {
    await db.collection("claims").doc(currentClaimId).set(data, { merge: true });
  } else {
    const doc = await db.collection("claims").add(data);
    currentClaimId = doc.id;
  }

  alert("Claim saved");
  loadClaims();
};

/***********************
 * Fill Form
 ***********************/
function fillForm(d) {
  if (!d) return;

  firstName.value = d.firstName || "";
  middleInitial.value = d.middleInitial || "";
  lastName.value = d.lastName || "";
  phone.value = d.phone || "";
  email.value = d.email || "";

  propAddr1.value = d.property?.addr1 || "";
  propAddr2.value = d.property?.addr2 || "";
  propCity.value = d.property?.city || "";
  propState.value = d.property?.state || "";
  propZip.value = d.property?.zip || "";

  reason.value = d.claim?.reason || "";
  estimatedLoss.value = d.claim?.estimatedLoss || "";
  dateOfLoss.value = d.claim?.dateOfLoss || "";
  causeOfLoss.value = d.claim?.causeOfLoss || "";
  description.value = d.claim?.description || "";

  insuranceCompany.value = d.insurance?.company || "";
  policyNumber.value = d.insurance?.policy || "";
  insuranceClaimNumber.value = d.insurance?.claimNumber || "";

  mortgageCompany.value = d.mortgage?.company || "";
  loanNumber.value = d.mortgage?.loan || "";

  notes.value = d.notes || "";
}
