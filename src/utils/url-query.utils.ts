export default class UrlQuery {

  public static encode(params: any): string {
    const httpBuildQuery = (obj: any) => {
      return Object.entries(obj).reduce((acc, [key, val]) => {
        if (val && typeof val === "object") {
          Object.keys(val).forEach(key => {
            (val as any)[`[${key}]`] = (val as any)[key];
            delete (val as any)[key];
          });
          httpBuildQuery(val).forEach(query => {
            acc.push(`${key}${query}`);
          })
        } else {
          acc.push(`${key}=${val}`)
        }
        return acc;
      }, [] as string[]);
    }

    return httpBuildQuery(params)
      .join("&")
  }

}