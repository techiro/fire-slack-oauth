import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "@firebase/firestore";
export namespace CustomSlack {
  export type User = {
    teamId: string;
    teamName: string;
    enterpriseId: string;
    enterpriseName: string;
    userToken: string;
    userId: string;
  };

  export const userConverter = {
    toFirestore(user: CustomSlack.User): DocumentData {
      return {
        teamId: user.teamId,
        teamName: user.teamName,
        enterpriseId: user.enterpriseId,
        enterpriseName: user.enterpriseName,
        userToken: user.userToken,
        userId: user.userId,
      };
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): CustomSlack.User {
      const data = snapshot.data(options)!;
      return {
        teamId: data.teamId,
        teamName: data.teamName,
        enterpriseId: data.enterpriseId,
        enterpriseName: data.enterpriseName,
        userToken: data.userToken,
        userId: data.userId,
      };
    },
  };
}
