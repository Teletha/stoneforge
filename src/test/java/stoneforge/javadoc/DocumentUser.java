/*
 * Copyright (C) 2020 stoneforge Development Team
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *          https://opensource.org/licenses/MIT
 */
package stoneforge.javadoc;

import java.io.IOException;

public class DocumentUser {

    public static void main(String[] args) throws IOException {
        Javadoc.with.sources("../sinobu/src/main/java")
                .output("docs/api")
                .product("Sinobu")
                .project("Sinobu")
                .version("1.0")
                .useExternalJDKDoc()
                .build()
                .show();
    }
}