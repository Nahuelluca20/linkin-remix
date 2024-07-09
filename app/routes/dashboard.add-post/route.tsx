import { LoaderFunctionArgs } from "@remix-run/cloudflare";
// import { getInstagramImageUrl } from "utils/get-instagram-image";
import { SessionStorage } from "~/modules/session.server";

export async function loader({ context, request }: LoaderFunctionArgs) {
  await SessionStorage.requireUser(context, request);

  // const getImage = await getInstagramImageUrl(
  //   "https://www.instagram.com/p/C9MxEt5tzr5/?igsh=MXhwam55bGV3cTh1Yw%3D%3D"
  // );

  return null;
}

export default function Route() {
  return <div>new post</div>;
}
