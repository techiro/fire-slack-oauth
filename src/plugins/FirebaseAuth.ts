import {
  Auth,
  signInWithEmailAndPassword,
  UserCredential,
} from "firebase/auth";

export const getFirebaseCredential = async (
  auth: Auth,
  email: string,
  password: string
): Promise<UserCredential> => {
  return new Promise<UserCredential>((resolve, reject) => {
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        return resolve(userCredential);
      })
      .catch((err) => {
        return reject(err);
      });
  });
};
