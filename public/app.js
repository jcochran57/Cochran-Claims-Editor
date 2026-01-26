const firebaseConfig = {
  apiKey: "AIzaSyB5v7ICjvpK1z7pMvvBhZWSYjGp_ac_A9U",
  authDomain: "cochran-claims.firebaseapp.com",
  projectId: "cochran-claims"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");
const newClaimBtn = document.getElementById("newClaimBtn");
const saveBtn = document.getElementById("saveBtn");
const claimSelect = document.getElementById("claimSelect");

let currentUser = null;
let currentClaimId = null;

signInBtn.onclick = () =>
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
signOutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
  currentUser = user;
  if (!user) return;
  signInBtn.disabled = true;
  signOutBtn.disabled = false;
  newClaimBtn.disabled = false;
  saveBtn.disabled = false;
  claimSelect.disabled = false;
  loadClaims();
});

async function loadClaims() {
  claimSelect.innerHTML = `<option value="">Select Claim…</option>`;
  const snap = await db.collection("claims")
    .where("userId","==",currentUser.uid)
    .orderBy("timestamp","desc")
    .get();

  snap.forEach(doc=>{
    const opt=document.createElement("option");
    opt.value=doc.id;
    opt.textContent=doc.data().lastName||doc.id;
    claimSelect.appendChild(opt);
  });
}

claimSelect.onchange = async ()=>{
  if(!claimSelect.value) return;
  currentClaimId=claimSelect.value;
  const doc=await db.collection("claims").doc(currentClaimId).get();
  fillForm(doc.data());
};

newClaimBtn.onclick=()=>{
  currentClaimId=null;
  document.querySelectorAll("input,textarea,select").forEach(e=>e.value="");
};

saveBtn.onclick=async()=>{
  const d={
    userId:currentUser.uid,
    timestamp: currentClaimId ? undefined : firebase.firestore.FieldValue.serverTimestamp()
  };

  document.querySelectorAll("input,textarea,select").forEach(el=>{
    if(el.id && el.id!=="timestamp"){
      d[el.id]=el.value;
    }
  });

  if(currentClaimId){
    await db.collection("claims").doc(currentClaimId).set(d,{merge:true});
  }else{
    const ref=await db.collection("claims").add(d);
    currentClaimId=ref.id;
  }

  const saved=await db.collection("claims").doc(currentClaimId).get();
  fillForm(saved.data());
  loadClaims();
  alert("Claim saved");
};

function fillForm(d){
  if(!d) return;
  if(d.timestamp?.toDate){
    timestamp.value=d.timestamp.toDate().toLocaleString();
  }
  Object.keys(d).forEach(k=>{
    const el=document.getElementById(k);
    if(el && k!=="timestamp"){
      el.value=d[k]||"";
    }
  });
}

