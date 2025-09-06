// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title InterestCalculator
 * @dev Handles real-time interest calculations for FluidVault
 * @notice Optimized for Somnia Network's high TPS and sub-second finality
 */
contract InterestCalculator {
    
    // ============ CONSTANTS ============
    
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60; // 31,536,000 seconds
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_RATE = 5000; // 50% max annual rate
    
    // ============ STATE VARIABLES ============
    
    mapping(address => uint256) public lastCalculationTime;
    mapping(address => uint256) public compoundFrequency; // Seconds between compounding
    
    // ============ EVENTS ============
    
    event InterestCalculated(
        address indexed user,
        address indexed token,
        uint256 principal,
        uint256 rate,
        uint256 timeElapsed,
        uint256 interest
    );
    
    event CompoundFrequencyUpdated(
        address indexed token,
        uint256 newFrequency
    );

    // ============ CONSTRUCTOR ============
    
    constructor() {
        // Set default compound frequency to 1 hour (3600 seconds)
        // This can be adjusted per token based on Somnia's capabilities
    }

    // ============ INTEREST CALCULATION FUNCTIONS ============
    
    /**
     * @dev Calculate simple interest for a given time period
     * @param principal Principal amount
     * @param annualRate Annual interest rate in basis points
     * @param timeElapsed Time elapsed in seconds
     * @return Interest amount
     */
    function calculateInterest(
        uint256 principal,
        uint256 annualRate,
        uint256 timeElapsed
    ) external pure returns (uint256) {
        require(annualRate <= MAX_RATE, "InterestCalculator: Rate too high");
        require(principal > 0, "InterestCalculator: Invalid principal");
        
        if (timeElapsed == 0) {
            return 0;
        }
        
        // Simple interest calculation: I = P * R * T
        // Where P = principal, R = rate per second, T = time in seconds
        uint256 ratePerSecond = (annualRate * BASIS_POINTS) / (BASIS_POINTS * SECONDS_PER_YEAR);
        uint256 interest = (principal * ratePerSecond * timeElapsed) / (BASIS_POINTS * BASIS_POINTS);
        
        return interest;
    }
    
    /**
     * @dev Internal function to calculate simple interest
     * @param principal Principal amount
     * @param annualRate Annual interest rate in basis points
     * @param timeElapsed Time elapsed in seconds
     * @return Interest amount
     */
    function _calculateSimpleInterest(
        uint256 principal,
        uint256 annualRate,
        uint256 timeElapsed
    ) internal pure returns (uint256) {
        require(annualRate <= MAX_RATE, "InterestCalculator: Rate too high");
        require(principal > 0, "InterestCalculator: Invalid principal");
        
        if (timeElapsed == 0) {
            return 0;
        }
        
        // Simple interest calculation: I = P * R * T
        uint256 ratePerSecond = (annualRate * BASIS_POINTS) / (BASIS_POINTS * SECONDS_PER_YEAR);
        uint256 interest = (principal * ratePerSecond * timeElapsed) / (BASIS_POINTS * BASIS_POINTS);
        
        return interest;
    }
    
    /**
     * @dev Calculate compound interest with configurable frequency
     * @param principal Principal amount
     * @param annualRate Annual interest rate in basis points
     * @param timeElapsed Time elapsed in seconds
     * @param compoundFreq Frequency of compounding in seconds
     * @return Interest amount
     */
    function calculateCompoundInterest(
        uint256 principal,
        uint256 annualRate,
        uint256 timeElapsed,
        uint256 compoundFreq
    ) external pure returns (uint256) {
        require(annualRate <= MAX_RATE, "InterestCalculator: Rate too high");
        require(principal > 0, "InterestCalculator: Invalid principal");
        require(compoundFreq > 0, "InterestCalculator: Invalid frequency");
        
        if (timeElapsed == 0) {
            return 0;
        }
        
        // Compound interest: A = P * (1 + r/n)^(n*t)
        // Where P = principal, r = annual rate, n = compounding frequency, t = time
        
        uint256 periods = timeElapsed / compoundFreq;
        if (periods == 0) {
            // If less than one compounding period, use simple interest
            return _calculateSimpleInterest(principal, annualRate, timeElapsed);
        }
        
        uint256 ratePerPeriod = (annualRate * compoundFreq) / (BASIS_POINTS * SECONDS_PER_YEAR);
        uint256 compoundFactor = BASIS_POINTS + ratePerPeriod;
        
        // Calculate (1 + r/n)^(n*t) using binary exponentiation
        uint256 exponentiatedFactor = _power(compoundFactor, periods);
        
        // Calculate final amount and subtract principal to get interest
        uint256 finalAmount = (principal * exponentiatedFactor) / (BASIS_POINTS ** periods);
        uint256 interest = finalAmount - principal;
        
        return interest;
    }
    
    /**
     * @dev Calculate real-time interest with continuous compounding approximation
     * @param principal Principal amount
     * @param annualRate Annual interest rate in basis points
     * @param timeElapsed Time elapsed in seconds
     * @return Interest amount
     */
    function calculateContinuousInterest(
        uint256 principal,
        uint256 annualRate,
        uint256 timeElapsed
    ) external pure returns (uint256) {
        require(annualRate <= MAX_RATE, "InterestCalculator: Rate too high");
        require(principal > 0, "InterestCalculator: Invalid principal");
        
        if (timeElapsed == 0) {
            return 0;
        }
        
        // Continuous compounding: A = P * e^(r*t)
        // Approximation: e^x ≈ 1 + x + x²/2! + x³/3! + ...
        // For small x, we can use: e^x ≈ 1 + x + x²/2
        
        uint256 ratePerSecond = (annualRate * BASIS_POINTS) / (BASIS_POINTS * SECONDS_PER_YEAR);
        uint256 exponent = (ratePerSecond * timeElapsed) / BASIS_POINTS;
        
        // For small exponents, use Taylor series approximation
        if (exponent < BASIS_POINTS / 100) { // Less than 1%
            uint256 exponentSquared = (exponent * exponent) / BASIS_POINTS;
            uint256 growthFactor = BASIS_POINTS + exponent + (exponentSquared / 2);
            uint256 finalAmount = (principal * growthFactor) / BASIS_POINTS;
            return finalAmount - principal;
        }
        
        // For larger exponents, fall back to simple interest
        return _calculateSimpleInterest(principal, annualRate, timeElapsed);
    }
    
    /**
     * @dev Calculate interest with dynamic rate adjustment
     * @param principal Principal amount
     * @param rates Array of interest rates in basis points
     * @param timePeriods Array of time periods for each rate
     * @return Total interest amount
     */
    function calculateVariableInterest(
        uint256 principal,
        uint256[] memory rates,
        uint256[] memory timePeriods
    ) external pure returns (uint256) {
        require(rates.length == timePeriods.length, "InterestCalculator: Array length mismatch");
        require(principal > 0, "InterestCalculator: Invalid principal");
        
        uint256 totalInterest = 0;
        uint256 currentPrincipal = principal;
        
        for (uint256 i = 0; i < rates.length; i++) {
            require(rates[i] <= MAX_RATE, "InterestCalculator: Rate too high");
            
            if (timePeriods[i] > 0) {
                uint256 periodInterest = _calculateSimpleInterest(
                    currentPrincipal,
                    rates[i],
                    timePeriods[i]
                );
                totalInterest += periodInterest;
                currentPrincipal += periodInterest; // Compound for next period
            }
        }
        
        return totalInterest;
    }

    // ============ UTILITY FUNCTIONS ============
    
    /**
     * @dev Calculate power using binary exponentiation
     * @param base Base number
     * @param exponent Exponent
     * @return Result of base^exponent
     */
    function _power(uint256 base, uint256 exponent) internal pure returns (uint256) {
        if (exponent == 0) {
            return BASIS_POINTS;
        }
        
        uint256 result = BASIS_POINTS;
        uint256 currentBase = base;
        
        while (exponent > 0) {
            if (exponent % 2 == 1) {
                result = (result * currentBase) / BASIS_POINTS;
            }
            currentBase = (currentBase * currentBase) / BASIS_POINTS;
            exponent = exponent / 2;
        }
        
        return result;
    }
    
    /**
     * @dev Set compound frequency for a token
     * @param token Token address
     * @param frequency Compounding frequency in seconds
     */
    function setCompoundFrequency(address token, uint256 frequency) external {
        require(frequency > 0, "InterestCalculator: Invalid frequency");
        require(frequency <= SECONDS_PER_YEAR, "InterestCalculator: Frequency too high");
        
        compoundFrequency[token] = frequency;
        emit CompoundFrequencyUpdated(token, frequency);
    }
    
    /**
     * @dev Get compound frequency for a token
     * @param token Token address
     * @return Compounding frequency in seconds
     */
    function getCompoundFrequency(address token) external view returns (uint256) {
        return compoundFrequency[token];
    }
    
    /**
     * @dev Calculate effective annual rate with compounding
     * @param nominalRate Nominal annual rate in basis points
     * @param compoundFreq Compounding frequency per year
     * @return Effective annual rate in basis points
     */
    function calculateEffectiveRate(
        uint256 nominalRate,
        uint256 compoundFreq
    ) external pure returns (uint256) {
        require(nominalRate <= MAX_RATE, "InterestCalculator: Rate too high");
        require(compoundFreq > 0, "InterestCalculator: Invalid frequency");
        
        // EAR = (1 + r/n)^n - 1
        uint256 ratePerPeriod = nominalRate / compoundFreq;
        uint256 compoundFactor = BASIS_POINTS + ratePerPeriod;
        uint256 exponentiatedFactor = _power(compoundFactor, compoundFreq);
        
        return exponentiatedFactor - BASIS_POINTS;
    }
    
    /**
     * @dev Convert between different time periods
     * @param amount Amount to convert
     * @param fromPeriod Source time period in seconds
     * @param toPeriod Target time period in seconds
     * @return Converted amount
     */
    function convertTimePeriod(
        uint256 amount,
        uint256 fromPeriod,
        uint256 toPeriod
    ) external pure returns (uint256) {
        require(fromPeriod > 0 && toPeriod > 0, "InterestCalculator: Invalid periods");
        
        return (amount * toPeriod) / fromPeriod;
    }
}
