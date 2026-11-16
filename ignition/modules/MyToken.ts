import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyTokenModule", (m) => {
  const initialSupply = 1_000_000n * 10n ** 18n;
  const myToken = m.contract("MyToken", [initialSupply]);

  return { myToken };
});
