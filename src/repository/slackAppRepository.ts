import {
  addDoc,
  collection,
  query,
  getDocs,
  where,
  Firestore,
  CollectionReference,
  DocumentData,
} from "@firebase/firestore";
import { CustomSlack } from "model/user";
import { getFirebaseCredential } from "plugins/FirebaseAuth";
import { Auth } from "firebase/auth";
import { FirebaseError } from "@firebase/util";
import { FirebaseRepository } from "./firebaseRepository";

export class SlackAppRepository
  implements FirebaseRepository<CustomSlack.User>
{
  private auth: Auth;
  private userCollectionRef: CollectionReference<DocumentData>;
  private email = process.env.SLACK_EMAIL!;
  private password = process.env.SLACK_PASSWORD!;

  constructor(auth: Auth, firestore: Firestore) {
    this.auth = auth;
    this.userCollectionRef = collection(firestore, "users");
  }

  storeFirestoreData(data: CustomSlack.User): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.firebaseCredential();
        await addDoc(
          this.userCollectionRef.withConverter(CustomSlack.userConverter),
          data
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async fetchFirestoreData(userId: string): Promise<string> {
    const q = query(this.userCollectionRef, where("userId", "==", userId));

    try {
      await this.firebaseCredential();
      const doc = await getDocs(q);
      if (!doc.empty) {
        return doc.docs[0].get("userToken").toString();
      } else {
        throw Error("no-data");
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        throw Error(error.code);
      } else if (error instanceof Error) {
        throw Error(error.message);
      }
      throw Error("unknown error");
    }
  }

  async firebaseCredential(): Promise<void> {
    try {
      await getFirebaseCredential(this.auth, this.email, this.password);
    } catch (error) {
      throw error;
    }
  }
}
