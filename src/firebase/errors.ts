export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete';
    requestResourceData?: any;
};
  
const FIRESTORE_PERMISSION_ERROR_NAME = 'FirestorePermissionError';

export class FirestorePermissionError extends Error {
    /**
     * The context of the security rule that failed.
     */
    public context: SecurityRuleContext;

    constructor(context: SecurityRuleContext) {
        const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify(
        {
            ...context,
        },
        null,
        2
        )}`;
        super(message);
        this.name = FIRESTORE_PERMISSION_ERROR_NAME;
        this.context = context;
        Object.setPrototypeOf(this, FirestorePermissionError.prototype);
    }
}
