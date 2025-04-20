import {
  Visitor,
  createFromIdls,
  renderJavaScriptVisitor
} from "@metaplex-foundation/kinobi";
import path from "path";

// Instantiate Kinobi.
const kinobi = createFromIdls([path.join(__dirname, "target/idl", "presale-kinobi.json")]);

// Update the Kinobi tree using visitors...

// Render JavaScript.
const jsDir = path.join(__dirname, "clients", "ts", "src", "generated");

kinobi.accept(renderJavaScriptVisitor(jsDir) as Visitor<void>);
