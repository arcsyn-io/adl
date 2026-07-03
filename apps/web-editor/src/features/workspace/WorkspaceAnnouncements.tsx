export function WorkspaceAnnouncements({message}:{readonly message:string}){return <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{message}</div>}
