import { getLogger } from "../../utils/logger";
import registry from "../../../static/registry";

const { trace } = getLogger("components:Analytics:");
const { trace: traceDev } = getLogger("components:Analytics(Inactive):");

export const validateEvent = ({ category, action, value }) => {
  if (!category) throw new Error("Category is required");
  if (!action) throw new Error("Action is required");
  if (value && typeof value !== "number")
    throw new Error("Value must be a number");
};

const stringifyEvent = ({ category, action, label, value }) =>
  `Category*: ${category}, Action*: ${action}, Label: ${label}, Value: ${value}`;

export const analyticsEvent = (window, evt) => {
  validateEvent(evt);
  if (typeof window !== "undefined" && typeof window.ga !== "undefined") {
    const { category, action, label, value, options = undefined } = evt;
    trace(stringifyEvent(evt));
    return window.ga("send", "event", category, action, label, value, options);
  }
  traceDev(stringifyEvent(evt));
  return null;
};

export const sendEventCertificateViewedDetailed = ({
  issuer,
  certificateData
}) => {
  const store =
    issuer.certificateStore || issuer.documentStore || issuer.tokenRegistry;
  const id = certificateData ? certificateData.id : "";
  const name = certificateData ? certificateData.name : "";
  const issuedOn = certificateData ? certificateData.issuedOn : "";
  let label = "";
  const registryIssuer = registry.issuers[store];
  let issuerName = "";
  if (registryIssuer) {
    issuerName = registryIssuer.name;
    label = `store:${store} document_id:${id} name:${name} issued_on:${issuedOn} issuer_name:${registryIssuer.name ||
      ""} issuer_id:${registryIssuer.id || ""}`;
  } else {
    issuerName = issuer.identityProof.location;
    label = `store:${store} document_id:${id} name:${name} issued_on:${issuedOn} issuer_name:${
      issuer.identityProof.location
    }`;
  }
  analyticsEvent(window, {
    category: "CERTIFICATE",
    action: `VIEWED - ${issuerName}`,
    label,
    options: { nonInteraction: true }
  });
};
