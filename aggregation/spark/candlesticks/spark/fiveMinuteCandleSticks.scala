// WE RUN THIS THROUGH spark-shell
// Import the relevant packages and classes
import com.mongodb.casbah.{WriteConcern => MongodbWriteConcern}
import com.stratio.provider._
import com.stratio.provider.mongodb._
import com.stratio.provider.mongodb.schema._
import com.stratio.provider.mongodb.writer._
import org.apache.spark.sql.hive.HiveContext
import MongodbConfig._

//Set the database where we going to fetch data and write data to.
val dbname = "sparkDemo"

//Configure which database and collection to read from, with optional parameters too
val mcInputBuilder = MongodbConfigBuilder(Map(Host -> List("localhost:27017"),
    Database -> dbname,
    Collection -> "minbars",
    SamplingRatio -> 1.0,
    WriteConcern -> MongodbWriteConcern.Normal))
val readConfig = mcInputBuilder.build()

//HiveContext uses Hive's SQL parser with a superset of features of SQLContext so I used that one
//	See http://spark.apache.org/docs/1.4.0/sql-programming-guide.html#starting-point-sqlcontext for more info

val sqlContext = new HiveContext(sc)			//sc is already defined as a SparkContext by the shell
val dfOneMin = sqlContext.fromMongoDB(readConfig) 	//set up the MongoDB collection to read from as a DataFrame
dfOneMin.registerTempTable("minbars")			//make the table minbars available to the SQL expressions later


//This applies a SQL windowing functions to partition the 1-minute bars into 5-minute windows
//	and then selects the open, high, low, & close price within each 5 minute window
val dfFiveMinForMonth = sqlContext.sql(
"""
SELECT m.Symbol, m.OpenTime as Timestamp, m.Open, m.High, m.Low, m.Close, m.Volume
FROM
(SELECT

    Symbol,
    FIRST_VALUE(Timestamp)
    OVER (
            PARTITION BY floor(unix_timestamp(Timestamp, 'yyyy-MM-dd HH:mm')/(5*60))
            ORDER BY Timestamp)

    as OpenTime,

    LAST_VALUE(Timestamp)
    OVER (
            PARTITION BY floor(unix_timestamp(Timestamp, 'yyyy-MM-dd HH:mm')/(5*60))
            ORDER BY Timestamp)

    as CloseTime,

    FIRST_VALUE(Open)
    OVER (
            PARTITION BY floor(unix_timestamp(Timestamp, 'yyyy-MM-dd HH:mm')/(5*60))
            ORDER BY Timestamp)

    as Open,
    MAX(High)
    OVER (
            PARTITION BY floor(unix_timestamp(Timestamp, 'yyyy-MM-dd HH:mm')/(5*60))
            ORDER BY Timestamp)

    as High,

    MIN(Low)
    OVER (
            PARTITION BY floor(unix_timestamp(Timestamp, 'yyyy-MM-dd HH:mm')/(5*60))
            ORDER BY Timestamp)

    as Low,
    LAST_VALUE(Close)
    OVER (
            PARTITION BY floor(unix_timestamp(Timestamp, 'yyyy-MM-dd HH:mm')/(5*60))
            ORDER BY Timestamp)

    as Close,
    SUM(Volume)
    OVER (
            PARTITION BY floor(unix_timestamp(Timestamp, 'yyyy-MM-dd HH:mm')/(5*60))
            ORDER BY Timestamp)

    as Volume
FROM minbars)
as m
WHERE unix_timestamp(m.CloseTime, 'yyyy-MM-dd HH:mm') - unix_timestamp(m.OpenTime, 'yyyy-MM-dd HH:mm') = 60*4"""
)

//Configure which table we want to write to in MongoDB
val fiveMinOutputBuilder = MongodbConfigBuilder(Map(Host -> List("localhost:27017"), Database -> dbname, Collection -> "fiveMinBars", SamplingRatio -> 1.0, WriteConcern -> MongodbWriteConcern.Normal, SplitKey -> "_id", SplitSize -> 8))
val writeConfig = fiveMinOutputBuilder.build()

//Write the data to MongoDB - because of Spark's just-in-time execution, this actually triggers running the query to read from the 1-minute bars table in MongoDB and then writing to the 5-minute bars table in MongoDB
dfFiveMinForMonth.saveToMongodb(writeConfig)


exit
