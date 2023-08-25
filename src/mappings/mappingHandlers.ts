import { SubstrateEvent } from "@subql/types";
import { Balance } from "@polkadot/types/interfaces";
import { decodeAddress } from "@polkadot/util-crypto";
import { Account, Slashed } from "../types";

export async function handleEvent(event: SubstrateEvent): Promise<void> {
  logger.info(
    `New slashed event found at block ${event.block.block.header.number.toString()}`
  );

  // Get data from the event
  // The staking.slashed.is event has the following payload \[account_id\]
  logger.info(JSON.stringify(event));
  const {
    event: {
      data: [account_id, amount],
    },
  } = event;

  const blockNumber: number = event.block.block.header.number.toNumber();

  const account: Account = await checkAndGetAccount(account_id.toString(), blockNumber);
  // Create the new slash entity
  const slashed = Slashed.create({
    id: `${event.block.block.header.number.toNumber()}-${event.idx}`,
    blockNumber,
    date: event.block.timestamp,
    accountId: account.id,
    amount: (amount as Balance).toBigInt()
  });

  await Promise.all([account.save(), slashed.save()]);
}

async function checkAndGetAccount(
  id: string,
  blockNumber: number
): Promise<Account> {
  let account = await Account.get(id.toLowerCase());
  if (!account) {
    // We couldn't find the account
    logger.info(
      `New account ${id.toLowerCase()} was slashed at block ${blockNumber.toString()}`
    );
    account = Account.create({
      id: id.toLowerCase(),
      publicKey: decodeAddress(id).toString().toLowerCase(),
      firstSlashedBlock: blockNumber,
    });
  } else {
    logger.info(
      `Previously slashed account ${id.toLowerCase()} was slashed at block ${blockNumber.toString()}`
    );
  }
  return account;
}
