/*
 * Copyright (C) 2019 Nameless Production Committee
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *          http://opensource.org/licenses/mit-license.php
 */
package stoneforge.javadoc.analyze;

public class SampleInfo {

    /** The class reference. */
    public final String classID;

    /** The method reference. */
    public final String methodID;

    /** The sample code. (raw text) */
    public final String code;

    /**
     * @param classID
     * @param methodID
     * @param code
     */
    public SampleInfo(String classID, String methodID, String code) {
        this.classID = classID;
        this.methodID = methodID;
        this.code = code;
    }

    /**
     * Get the sample id.
     * 
     * @return
     */
    public String id() {
        return classID + "#" + methodID;
    }
}
