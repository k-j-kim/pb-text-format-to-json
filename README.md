# pb-text-format-to-json

[Protobuf Text Format](https://developers.google.com/protocol-buffers/docs/reference/cpp/google.protobuf.text_format) to JSON parser.

For example, parses [Google font's `METADATA.pb`](https://github.com/google/fonts/blob/master/apache/roboto/METADATA.pb) to JSON.

```js
import { parse } from "pb-text-format-to-json";
import fs from "fs";

const input = fs.readFileSync("path/to/pb", "utf-8");
const output = parse(input);
```

Derived from [protobuf-textformat](https://github.com/brotchie/protobuf-textformat).
