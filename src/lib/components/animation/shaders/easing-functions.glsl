
float qinticInOut(float t) {
	return t < 0.5 ? 
		16 * pow(t, 5) : 
		-0.5 * pow(2 * t - 2, 5) + 1;
}

float quarticInOut(float t) {
	return t < 0.5 ? 
		8 * pow(t, 4) : 
		-8 * pow(t - 1, 4) + 1;
}