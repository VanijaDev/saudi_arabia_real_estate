const Residents = artifacts.require("./Residents.sol");

const {
  BN,
  time,
  constants,
  balance,
  ether,
  expectEvent,
  expectRevert
} = require('openzeppelin-test-helpers');

contract("Residents", function (_accounts) {
  const OWNER = _accounts[0];

  const RESIDENT_0_ADDRESS = _accounts[1];
  const RESIDENT_1_ADDRESS = _accounts[2];

  let residents;

  beforeEach("setup", async () => {
    await time.advanceBlock();
    residents = await Residents.new();
  });

  describe("Add resident", () => {
    it("should fail if not owner", async () => {
      await expectRevert(residents.addResident(RESIDENT_0_ADDRESS, {
        from: RESIDENT_0_ADDRESS
      }), "Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner");
    });

    it("should fail if resident is present", async () => {
      await residents.addResident(RESIDENT_0_ADDRESS, {
        from: OWNER
      });

      await expectRevert(residents.addResident(RESIDENT_0_ADDRESS, {
        from: OWNER
      }), "Resident exists");
    });

    it("should increase residents amount", async () => {
      const prevAmount = await residents.residentAmount.call();

      //  1
      await residents.addResident(RESIDENT_0_ADDRESS, {
        from: OWNER
      });
      assert.equal((await residents.residentAmount.call()).sub(prevAmount), 1, "wrong amount after 1");

      //  2
      await residents.addResident(RESIDENT_1_ADDRESS, {
        from: OWNER
      });
      assert.equal((await residents.residentAmount.call()).sub(prevAmount), 2, "wrong amount after 2");
    });

    it("should create resident obj with correct address, but other empty fields", async () => {
      await residents.addResident(RESIDENT_0_ADDRESS, {
        from: OWNER
      });
      let resident_0 = await residents.residents.call(RESIDENT_0_ADDRESS);
      assert.equal(resident_0.addr, RESIDENT_0_ADDRESS, "wrong address");
      assert.equal(resident_0.fullName, "", "wrong fullName");
      assert.equal(resident_0.email, "", "wrong email");
      assert.equal(resident_0.password, "", "wrong password");
    });
  });

  describe("Update resident", () => {
    const RESIDENT_0_FULLNAME = "RESIDENT_0_FULLNAME";
    const RESIDENT_0_EMAIL = "RESIDENT_0_EMAIL@gmail.com";
    const RESIDENT_0_PASSWORD = "RESIDENT_0_PASSWORD";

    it("should fail if not correct resident - no such resident", async () => {
      await residents.addResident(RESIDENT_1_ADDRESS, {
        from: OWNER
      });

      await expectRevert(residents.updateResident(RESIDENT_0_FULLNAME, RESIDENT_0_EMAIL, RESIDENT_0_PASSWORD, {
        from: RESIDENT_0_ADDRESS
      }), "Wrong resident");
    });

    it("should update obj with correct info", async () => {
      await residents.addResident(RESIDENT_0_ADDRESS, {
        from: OWNER
      });

      await residents.updateResident(RESIDENT_0_FULLNAME, RESIDENT_0_EMAIL, RESIDENT_0_PASSWORD, {
        from: RESIDENT_0_ADDRESS
      });
      let resident_0 = await residents.residents.call(RESIDENT_0_ADDRESS);
      assert.equal(resident_0.addr, RESIDENT_0_ADDRESS, "wrong address");
      assert.equal(resident_0.fullName, RESIDENT_0_FULLNAME, "wrong fullName");
      assert.equal(resident_0.email, RESIDENT_0_EMAIL, "wrong email");
      assert.equal(resident_0.password, RESIDENT_0_PASSWORD, "wrong password");
    });
  });
});