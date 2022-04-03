export interface FirebaseRepository<T> {
  fetchFirestoreData(path: string): Promise<any>;
  storeFirestoreData(data: T): Promise<any>;
}
